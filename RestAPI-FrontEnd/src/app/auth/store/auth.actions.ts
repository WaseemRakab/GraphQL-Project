import {createAction, props} from '@ngrx/store';
import {Credentials} from '../models/credentials.model';
import {AuthData, SignInData} from '../auth/auth.service';


export const signupSuccess = createAction('[Auth] Signup Success', props<AuthData>());
export const loginSuccess = createAction('[Auth] Login Success', props<SignInData>());

export const authenticateFail = createAction('[Auth] Authenticate Fail', props<{ errorMessage: string }>());

export const loginStart = createAction('[Auth] Login Start', props<{ email: string, password: string }>());
export const signupStart = createAction('[Auth] Signup Start', props<{ credentials: Credentials }>());

export const logout = createAction('[Auth] Logout');
export const autoLogin = createAction('[Auth] Auto Login');
