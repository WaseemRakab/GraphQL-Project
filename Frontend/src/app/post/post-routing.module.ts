import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from '../auth/auth/auth.guard';
import {PostListComponent} from './post-list/post-list.component';
import {ViewPostComponent} from './view-post/view-post.component';
import {ViewPostGuard} from './view-post.guard';
import {ViewPostResolver} from './view-post.resolver';

const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      {path: '', component: PostListComponent},
      {path: 'post/:postId', component: ViewPostComponent, canActivate: [ViewPostGuard], resolve: {post: ViewPostResolver}},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostRoutingModule {
}
