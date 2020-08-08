import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {logout} from '../store/auth.actions';
import {Credentials} from '../models/credentials.model';
import {map, pluck, tap} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LoadingDialogComponent} from '../../extras/loading-dialog/loading-dialog.component';
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

export interface SignInResponseData {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  token: string;
  expiresIn: string;
  error?: {
    message?: any;
    stackTrace?: any;
    data?: any[]
  };
}

export interface AuthData {
  userId: string;
  redirect: boolean;
}

export interface SignInData extends AuthData {
  email: string;
  token: string;
  expirationDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  tokenExpirationTime;
  errorMessage: string = null;

  private dialogRef: MatDialogRef<LoadingDialogComponent>;

  constructor(private store: Store<fromApp.AppState>,
              private dialog: MatDialog,
              private apollo: Apollo) {
  }

  public createUser(user: Credentials) {
    const mutation = gql`
      mutation {
        createUser(userInput: {email: "${user.email}",name: "${user.name}",password:"${user.password}"}) {
          _id
        }
      }
    `;
    return this.apollo.mutate<{ createUser: { _id: string } }>({mutation})
      .pipe(pluck('data', 'createUser', '_id'));
  }

  public login(user: { email: string, password: string }) {
    const query = gql`
      query {
        login(email: "${user.email}", password: "${user.password}"){
          email
          expiresIn
          token
          userId
        }
      }
    `;
    return this.apollo.query<{ login: SignInResponseData }>({query})
      .pipe(pluck('data', 'login'));
  }

  public verifyUser(token: string) {
    const query = gql`
      query {
        verifyUser(token: "${token}"){
          email
          message
          success
          userId
        }
      }
    `;
    return this.apollo.query<{ verifyUser: SignInResponseData }>({query})
      .pipe(pluck('data', 'verifyUser'));
  }

  public getUserStatus() {
    const query = gql`
      query {
        userStatus{
          status
        }
      }
    `;
    return this.apollo.query<{ userStatus: { status: string } }>({query})
      .pipe(pluck('data', 'userStatus'));
  }

  public onAuthStart() {
    return this.store
      .pipe
      (
        select('auth'),
        map(authState => {
          return {loading: authState.loading, errorMessage: authState.authError};
        }),
        tap(state => {
          this.errorMessage = state.errorMessage;
          if (!state.loading) {
            if (this.dialogRef) {
              this.dialogRef.close();
            }
            return;
          }
          this.dialogRef = this.dialog.open(LoadingDialogComponent, {disableClose: true});
        }));
  }

  setLogoutTimer(expirationDuration: number) {
    console.log(expirationDuration);
    this.tokenExpirationTime = setTimeout(() => {
      this.store.dispatch(logout());
    }, expirationDuration);
  }

  clearLogoutTime() {
    if (this.tokenExpirationTime) {
      clearTimeout(this.tokenExpirationTime);
      this.tokenExpirationTime = null;
    }
  }
}
