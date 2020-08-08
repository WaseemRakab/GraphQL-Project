import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {map, take, tap} from 'rxjs/operators';
import {autoLogin} from '../store/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(private store: Store<fromApp.AppState>,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.store.select('auth')
      .pipe(
        take(1),
        tap((authState) => {
          if (!authState.user) {
            this.store.dispatch(autoLogin());
          }
        }),
        map(authState => {
          const isAuth = !!authState.user;
          if (isAuth) {
            return true;
          }
          return this.router.createUrlTree(['/auth']);
        })
      );
  }
}
