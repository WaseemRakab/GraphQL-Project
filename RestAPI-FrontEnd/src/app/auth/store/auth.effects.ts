import {Actions, createEffect, ofType} from '@ngrx/effects';
import {authenticateFail, loginSuccess, logout, signupSuccess} from './auth.actions';
import {HttpClient} from '@angular/common/http';
import {EMPTY, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService, SignInResponseData} from '../auth/auth.service';
import * as authActions from '../store/auth.actions';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {User} from '../models/user.model';


const handleSignIn = (resData: SignInResponseData) => {
  const expirationDate = new Date(new Date().getTime() + +resData.expiresIn);
  const userData: { token: string, expiryDate: Date } = {
    token: `Bearer ${resData.token}`,
    expiryDate: expirationDate
  };
  localStorage.setItem('exp', userData.expiryDate.toUTCString());
  localStorage.setItem('token', userData.token);
  return loginSuccess({
    email: resData.email,
    userId: resData.userId,
    expirationDate,
    redirect: true,
    token: userData.token
  });
};

const handleError = (err: any) => {
  return of(authenticateFail({errorMessage: handleAuthError(err)}));
};

const handleAuthError = (error: any | { data: any, statusCode: string, message: string }): string => {
  const errorMessage = 'An unknown error occurred !';
  if (!error || !error.message) {
    return errorMessage;
  }
  switch (error.message) {
    case 'EMAIL_EXISTS':
      return 'This email already exists';
    case 'EMAIL_NOT_FOUND':
      return 'Email not found';
    case 'INVALID_PASSWORD':
      return 'Your password is invalid';
    case 'BAD_REQUEST':
      return 'Bad Request!';
    default:
      return errorMessage;
  }
};

@Injectable()
export class AuthEffects {
  authSignup = createEffect(() =>
    this.actions$.pipe(
      ofType(authActions.signupStart),
      switchMap((signup) => {
        return this.authService.createUser(signup.credentials).pipe(
          map((userId) => {
            return signupSuccess({userId, redirect: true});
          }),
          catchError(err => {
            return handleError(err);
          })
        );
      })
    ));

  authLogin = createEffect(() => this.actions$
    .pipe(
      ofType(authActions.loginStart),
      switchMap(loginData => {
        return this.authService.login({email: loginData.email, password: loginData.password})
          .pipe(
            tap(resData => {
              this.authService.setLogoutTimer(+resData.expiresIn);
            }),
            map(resData => {
              return handleSignIn(resData);
            }),
            catchError((error) => {
              const errors = (error.graphQLErrors as { data: any, statusCode: string, message: string }[])[0];
              return handleError(errors);
            }));
      })
    ));

  autoLogin = createEffect(() => this.actions$
    .pipe(
      ofType(authActions.autoLogin),
      switchMap(() => {
        const token = localStorage.getItem('token');
        const expiryDate = localStorage.getItem('exp');
        if (!token || !expiryDate) {
          return of({type: 'DUMMY'});
        }
        return this.authService.verifyUser(token)
          .pipe
          (
            map(user => {
              const userModel = new User(user.email, token, new Date(expiryDate), user.userId);
              const expirationDuration = new Date(expiryDate).getTime() - new Date().getTime();
              this.authService.setLogoutTimer(expirationDuration);
              return loginSuccess({
                email: userModel.email,
                expirationDate: new Date(expiryDate),
                userId: user.userId,
                redirect: true,
                token
              });
            }),
            catchError(errorResponse => {
              const errMessage = errorResponse.message;
              if (errMessage && errMessage === 'TOKEN_EXPIRED') {
                return of(logout());
              }
              return of({type: 'DUMMY'});
            })
          );
      })
    ));

  authLogout = createEffect(() => this.actions$.pipe(
    ofType(logout),
    switchMap(() => {
      this.authService.clearLogoutTime();
      localStorage.removeItem('exp');
      localStorage.removeItem('token');
      return this.router.navigate(['/auth']);
    })), {dispatch: false});

  signupRedirect = createEffect(() => this.actions$
    .pipe
    (
      ofType(authActions.signupSuccess),
      switchMap((authAction) => {
        if (authAction.redirect) {
          return this.router.navigate(['/auth/login']);
        }
        return EMPTY;
      })
    ), {dispatch: false});

  public loginRedirect = createEffect(() => this.actions$
    .pipe(
      ofType(authActions.loginSuccess),
      switchMap(authAction => {
        if (authAction.redirect) {
          return this.router.navigate(['/']);
        }
        return EMPTY;
      })
    ), {dispatch: false});

  constructor(private actions$: Actions,
              private httpClient: HttpClient,
              private router: Router,
              private authService: AuthService) {
  }
}
