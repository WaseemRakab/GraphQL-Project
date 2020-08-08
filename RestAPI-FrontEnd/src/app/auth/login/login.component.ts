import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {autoLogin, loginStart} from '../store/auth.actions';
import {Subscription} from 'rxjs';
import {AuthService} from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  pasted = false;

  loginForm: FormGroup;

  storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>,
              public authService: AuthService) {
  }

  ngOnInit(): void {
    this.store.dispatch(autoLogin());
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(8)])
    });
    this.storeSub =
      this.authService.onAuthStart()
        .subscribe();
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }

  errorHandling(controlName: string, errorParam: string) {
    return this.loginForm.get(controlName).hasError(errorParam);
  }

  preventPastePass(event: Event) {
    event.preventDefault();
    this.pasted = true;
    setTimeout(() => {
      this.pasted = false;
    }, 2000);
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }
    const loginCredentials = this.loginForm.value as { email: string, password: string };

    this.store.dispatch(loginStart(loginCredentials));
  }
}
