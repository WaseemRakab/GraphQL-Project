import {Component, Inject, OnInit} from '@angular/core';
import {EMPTY, Observable, Subscription, throwError} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {generateBase64FromImageFile} from '../../extras/imageHandler';
import {catchError, finalize, map, switchMap, take, tap} from 'rxjs/operators';
import {PostsService} from '../posts.service';

@Component({
  selector: 'app-post-view-image-dialog',
  templateUrl: './post-view-image-dialog.html',
  styleUrls: ['./post-view-image-dialog.component.scss']
})
export class PostViewImageDialogComponent implements OnInit {
  loadingImage: boolean;
  image: { image64: string, alt: string };
  imageNotFound = false;
  private imageSub: Subscription;

  constructor(@Inject(MAT_DIALOG_DATA) private $imageObs: Observable<{ imagePath: string, alt: string }>,
              private postService: PostsService) {
  }

  ngOnInit(): void {
    this.loadingImage = true;
    this.imageSub = this.$imageObs
      .pipe
      (
        take(1),
        switchMap((image: { imagePath: string, alt: string }) => {
          if (image === null) {
            return throwError(null);
          }
          return this.postService.getImageFile(image.imagePath).pipe(map((blob: Blob) => {
            return {blob, alt: image.alt};
          }));
        }),
        switchMap((result: { blob: Blob, alt: string }) => {
          return generateBase64FromImageFile(result.blob).pipe(map((image64: string) => {
            return {image64, alt: result.alt};
          }));
        }),
        tap(image => {
          this.image = {
            alt: image.alt,
            image64: image.image64
          };
        }),
        catchError(() => {
          this.imageNotFound = true;
          return EMPTY;
        }),
        finalize(() => {
          this.loadingImage = false;
        }))
      .subscribe();
  }
}
