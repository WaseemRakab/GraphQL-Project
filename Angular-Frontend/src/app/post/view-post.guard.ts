import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {PostsService} from './posts.service';
import {catchError, map} from 'rxjs/operators';
import {LoggingService} from '../extras/logging.service';

@Injectable({
  providedIn: 'root'
})
export class ViewPostGuard implements CanActivate {
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const postId = next.paramMap.get('postId');
    return this.postsService.getPost(postId)
      .pipe(
        map((response) => {
          if (response.success) {
            this.postsService.postViewSubject.next(response.post);
            return true;
          }
          return false;
        }),
        catchError(response => {
          this.loggingService.logError(response.error);
          return of(this.router.createUrlTree(['./']));
        }));
  }

  constructor(private postsService: PostsService,
              private router: Router,
              private loggingService: LoggingService) {
  }
}
