import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Post} from '../models/Post';
import {Observable} from 'rxjs';
import {PostsService} from './posts.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewPostResolver implements Resolve<Post> {
  constructor(private postsService: PostsService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Post> | Promise<Post> | Post {
    return this.postsService.postViewSubject.getValue();
  }
}
