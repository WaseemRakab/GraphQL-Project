import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PostDialogComponent} from './post-dialog/post-dialog.component';
import {PostDeleteDialogComponent} from './post-delete-dialog/post-delete-dialog.component';
import {PostListComponent} from './post-list/post-list.component';
import {ViewPostComponent} from './view-post/view-post.component';
import {PostViewImageDialogComponent} from './post-view-image-dialog/post-view-image-dialog';
import {SharePostSheetComponent} from './view-post/share-post-sheet/share-post-sheet.component';
import {SharedModule} from '../shared/shared.module';
import {HomeComponent} from './home/home.component';
import {PostRoutingModule} from './post-routing.module';


@NgModule({
  declarations: [
    HomeComponent,
    PostDialogComponent,
    PostDeleteDialogComponent,
    PostListComponent,
    ViewPostComponent,
    PostViewImageDialogComponent,
    SharePostSheetComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PostRoutingModule
  ]
})
export class PostModule {
}
