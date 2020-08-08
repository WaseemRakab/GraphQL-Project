import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from '../login/login.component';
import {SignUpComponent} from '../signup/sign-up.component';
import {AuthRoutingModule} from './auth.routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    SignUpComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule {
}
