import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {PostsDataSource} from '../posts-DataSource';
import {PostsService} from '../posts.service';
import {map, tap} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PostDialogComponent} from '../post-dialog/post-dialog.component';
import {Post} from '../../models/Post';
import {Observable, Subscription} from 'rxjs';
import ObjectID from 'bson-objectid';
import {PostDeleteDialogComponent} from '../post-delete-dialog/post-delete-dialog.component';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingDialogComponent} from '../../extras/loading-dialog/loading-dialog.component';
import {select, Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {PostsWebsocketService} from '../posts.websocket.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, AfterViewInit, OnDestroy {
  postsSource: PostsDataSource;
  dialogRef: MatDialogRef<PostDialogComponent>;
  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;
  currUserId: Observable<string>;

  private dialogSubs: Subscription[] = [];
  private readonly wsSubscription: Subscription;

  constructor(private postsService: PostsService,
              private dialog: MatDialog,
              private router: Router,
              private store: Store<fromApp.AppState>,
              private postsWebsocketService: PostsWebsocketService,
              private activatedRoute: ActivatedRoute) {
    this.postsSource = new PostsDataSource(this.postsService);
    this.currUserId = this.store
      .pipe(
        select('auth'),
        map(authState => {
          return authState.user;
        }),
        map(user => {
          if (!user) {
            return null;
          }
          return user.id;
        }));
    this.wsSubscription = this.postsWebsocketService.onPostsChange.subscribe(changedValue => {
      if (changedValue !== null) {
        this.postsSource.onPostChanges(changedValue);
      }
    });
  }

  public authorizedToEdit(postCreatorId: string, userId: string): boolean {
    return postCreatorId === userId;
  }

  ngOnInit(): void {
    this.postsSource.loadPosts();
    this.dialogSubs.push(this.postsService.onPostSubmitted.subscribe((deleteSubmitted) => {
      if (deleteSubmitted) {
        this.paginator.pageIndex = 0;
      }
      this.triggerRefreshPosts();
    }));
  }

  ngAfterViewInit(): void {
    this.paginator.page.pipe(
      tap(() => this.loadPostsPage())
    ).subscribe();
  }

  loadPostsPage() {
    this.postsSource.loadPosts(
      this.paginator.pageIndex,
      this.paginator.pageSize);
  }

  openEditDialog(element: Post) {
    this.dialogRef = this.dialog.open<PostDialogComponent, Post>(PostDialogComponent, {disableClose: true, data: element, width: '600px'});
    const dialogCompInstance = this.dialogRef.componentInstance;
    this.dialogSubs.push(dialogCompInstance.finishedDialog.subscribe(() => {
      this.dialogRef.close();
    }));
  }

  openDeleteDialog(postId: ObjectID | string) {
    const deleteDialogRef = this.dialog.open(PostDeleteDialogComponent, {data: postId, disableClose: true});
    const deleteDialogCompInstance = deleteDialogRef.componentInstance;
    this.dialogSubs.push(deleteDialogCompInstance.finishedDialog.subscribe(() => {
      deleteDialogRef.close();
    }));
  }

  ngOnDestroy(): void {
    for (const dialogSub of this.dialogSubs) {
      dialogSub.unsubscribe();
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  viewPost(postId: string | ObjectID) {
    const dialog = this.dialog.open(LoadingDialogComponent, {disableClose: true});
    this.router.navigate([`post/${postId}`], {relativeTo: this.activatedRoute}).then((result) => {
      if (result) {
        dialog.close();
      }
    });
  }

  private triggerRefreshPosts() {
    this.loadPostsPage();
  }
}
