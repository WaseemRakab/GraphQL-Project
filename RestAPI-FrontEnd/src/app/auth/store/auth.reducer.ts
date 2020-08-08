import {authenticateFail, loginStart, loginSuccess, logout, signupStart, signupSuccess} from './auth.actions';
import {createReducer, on} from '@ngrx/store';
import {User} from '../models/user.model';

export interface State {
  user: User;
  authError: string;
  loading: boolean;
}

const initialState: State = {
  user: null,
  authError: null,
  loading: false,
};

const mAuthReducer = createReducer(initialState,
  on(loginSuccess, (state, action) => {
    const user = new User(action.email, action.token, action.expirationDate, action.userId);
    return {
      ...state,
      authError: null,
      user,
      loading: false,
    };
  }),
  on(logout, (state) => {
    return {
      ...state,
      user: null
    };
  }),
  on(signupSuccess, (state) => {
    return {
      ...state,
      loading: false,
      authError: null
    };
  }),
  on(loginStart, signupStart, (state) => {
    return {
      ...state,
      authError: null,
      loading: true
    };
  }),
  on(authenticateFail, (state, action) => {
    return {
      ...state,
      userId: null,
      authError: action.errorMessage,
      loading: false
    };
  })
);

export function authReducer(state, action) {
  return mAuthReducer(state, action);
}


