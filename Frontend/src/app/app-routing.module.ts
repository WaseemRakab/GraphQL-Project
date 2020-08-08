import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {NotFoundComponent} from './notfound/notfound.component';

const routes: Routes = [
  {path: '', loadChildren: () => import('./post/post.module').then(m => m.PostModule)},
  {path: 'auth', loadChildren: () => import('./auth/auth/auth.module').then(m => m.AuthModule)},
  {path: 'notfound', component: NotFoundComponent},
  {path: '**', redirectTo: '/notfound'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
