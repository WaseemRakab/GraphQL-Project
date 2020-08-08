import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../login/login.component';
import {SignUpComponent} from '../signup/sign-up.component';
import {NgModule} from '@angular/core';


const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'sign-up', component: SignUpComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
