import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {passwordsMismatchValidator} from '../../shared/password-mismatch.directive';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import {autoLogin, signupStart} from '../store/auth.actions';
import {Credentials} from '../models/credentials.model';
import {AuthService} from '../auth/auth.service';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  pasted: boolean;

  signUpForm: FormGroup;

  storeSub: Subscription;

  constructor(private store: Store<fromApp.AppState>,
              public authService: AuthService) {
  }

  ngOnInit(): void {
    this.store.dispatch(autoLogin());
    this.signUpForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      passwords: new FormGroup({
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8)])
      }, passwordsMismatchValidator)
    });

    this.storeSub =
      this.authService.onAuthStart()
        .subscribe();
  }

  errorHandling(controlName: string, errorParam: string) {
    return this.signUpForm.get(controlName).hasError(errorParam);
  }

  signUp() {
    if (this.signUpForm.invalid) {
      return;
    }
    const credentials: Credentials = {
      email: this.signUpForm.value.email,
      name: this.signUpForm.value.name,
      password: this.signUpForm.value.passwords.password,
    };
    this.store.dispatch(signupStart({credentials}));
  }

  ngOnDestroy(): void {
    if (this.storeSub) {
      this.storeSub.unsubscribe();
    }
  }
}
