import {Post, PostsView} from '../models/Post';
import {BehaviorSubject, of} from 'rxjs';
import {PostsService} from './posts.service';
import {catchError, finalize} from 'rxjs/operators';
import {ChangePostActions} from './posts.websocket.service';

export class PostsDataSource {

  public errorOccurred = false;

  private postsSubject = new BehaviorSubject<Post[]>([]);
  public postsObservable = this.postsSubject.asObservable();

  private loadingPosts = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingPosts.asObservable();

  private postsLengthSubject = new BehaviorSubject<number>(0);
  public postsLengthObservable = this.postsLengthSubject.asObservable();

  private postChangesHandler = {
    onPostCreate: (changeEvent: { post?: Post, postId?: string }) => {
      this.postsLengthSubject.next(this.postsLengthSubject.getValue() + 1);
      return this.postsSubject.next([changeEvent.post, ...this.postsSubject.getValue()]);
    },
    onPostEdit: (changeEvent: { post?: Post, postId?: string }) => {
      const updatedProducts = this.postsSubject.getValue();
      const toUpdateProductIndex = updatedProducts.findIndex(post => {
        return changeEvent.postId === post._id;
      });
      updatedProducts[toUpdateProductIndex] = changeEvent.post;
      this.postsSubject.next(updatedProducts);
    },
    onPostDelete: (changeEvent: { post?: Post, postId?: string }) => {
      this.postsSubject.next(this.postsSubject.getValue().filter(post => changeEvent.postId !== post._id));
      this.postsLengthSubject.next(this.postsLengthSubject.getValue() - 1);
    }
  };

  constructor(private postsService: PostsService) {
  }

  public loadPosts(pageIndex?: number, pageSize?: number) {
    this.loadingPosts.next(true);
    this.postsService.getPosts(pageIndex, pageSize)
      .pipe(
        catchError((err) => {
          this.errorOccurred = true;
          return of([]);
        }),
        finalize(() => {
          this.loadingPosts.next(false);
        })
      ).subscribe((postsView: PostsView) => {
      this.postsLengthSubject.next(postsView.length);
      this.postsSubject.next(postsView.posts || []);
    });
  }

  public onPostChanges(changedValue: { action: ChangePostActions, post?: Post, postId?: string }) {
    this.postChangesHandler[`onPost${changedValue.action}`]({post: changedValue.post, postId: changedValue.postId});
  }
}
