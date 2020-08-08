import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';
import {Post} from '../../models/Post';
import {map} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {PostViewImageDialogComponent} from '../post-view-image-dialog/post-view-image-dialog';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {SharePostSheetComponent} from './share-post-sheet/share-post-sheet.component';

@Component({
  selector: 'app-view-post',
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {

  postData: Observable<Post> = new Observable<Post>();

  constructor(private activatedRoute: ActivatedRoute,
              private matDialog: MatDialog,
              private bottomSheet: MatBottomSheet) {
  }

  ngOnInit(): void {
    this.postData = this.activatedRoute.data
      .pipe(
        map(data => {
          return data.post as Post;
        })
      );
  }

  showImage() {
    this.matDialog.open(PostViewImageDialogComponent, {
      data: this.postData
        .pipe
        (
          map(post => {
            return {
              imagePath: post.image,
              alt: post.title
            };
          })
        ),
      width: '550px',
      maxWidth: '100vw'
    });
  }

  openShareSheet() {
    this.bottomSheet.open(SharePostSheetComponent, {data: this.postData});
  }
}
