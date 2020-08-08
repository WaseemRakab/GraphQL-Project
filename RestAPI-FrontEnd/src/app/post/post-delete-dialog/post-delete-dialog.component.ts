import {Component, Inject, OnDestroy} from '@angular/core';
import {of, Subject, Subscription} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {PostsService} from '../posts.service';
import {catchError, finalize} from 'rxjs/operators';

@Component({
  selector: 'app-delete-post-dialog',
  templateUrl: './post-delete-dialog.component.html',
  styleUrls: ['./post-delete-dialog.component.scss']
})
export class PostDeleteDialogComponent implements OnDestroy {
  matData: string;

  finishedDialog: Subject<void> = new Subject<void>();
  onDeleting: boolean;
  onDeleted: boolean;
  deleteProgress: boolean;

  deleteErrors: string[];

  onDeleteError: boolean;

  private deleteSub: Subscription;


  constructor(@Inject(MAT_DIALOG_DATA) data: string,
              private postsService: PostsService) {
    this.matData = data;
  }

  deletePost() {
    this.deleteProgress = true;
    const postId = this.matData;
    this.onDeleting = true;
    this.deleteSub = this.postsService.deletePost(postId)
      .pipe
      (
        catchError((error) => {
          return of(error.graphQLErrors);
        }),
        finalize(() => {
          this.onDeleting = false;
        })
      ).subscribe(response => {
        if (!response || !response.success) {
          this.deleteErrors = response.errors;
          return this.onDeleteError = true;
        }
        this.onDeleted = true;
        setTimeout(() => {
          this.finishedDialog.next();
          this.postsService.onPostSubmitted.next(true);
        }, 1500);
      });
  }

  ngOnDestroy() {
    if (this.deleteSub) {
      this.deleteSub.unsubscribe();
    }
  }
}
