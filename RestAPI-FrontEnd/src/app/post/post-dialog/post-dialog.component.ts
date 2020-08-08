import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Post} from '../../models/Post';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PostsService} from '../posts.service';
import {catchError, switchMap} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../extras/confirm-dialog/confirm-dialog.component';
import {invalidImage} from '../../shared/url-check.directive';

@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.scss']
})
export class PostDialogComponent implements OnInit, OnDestroy {
  postForm: FormGroup;
  matData: Post;
  finishedDialog: Subject<void> = new Subject<void>();
  editMode = false;
  editedImage = false;
  onSubmitting: boolean;
  onSubmitError: boolean;
  submitErrors: string[];
  submitProgress: boolean;

  private submitObserver: Observable<any>;
  private obSubs: Subscription[] = [];

  private submitSub: Subscription;

  @ViewChild('focusMessage', {static: true})
  private focusMessage: ElementRef;
  private onSubmitted: boolean;

  errorObject: any;

  constructor(@Inject(MAT_DIALOG_DATA) data: Post,
              private postsService: PostsService,
              private matDialogRef: MatDialogRef<PostDialogComponent>,
              private matDialog: MatDialog) {
    if (data) {
      this.editMode = true;
    }
    this.matData = data || new Post();
  }

  get uploadOption(): 'Upload' | 'URL' {
    return this.postForm.get('imageUpload.uploadOption').value;
  }

  get getFormValue() {
    return this.postForm.value as Post;
  }

  get isSubmitted() {
    if (this.onSubmitted) {
      this.focusMessage.nativeElement.scrollIntoView();
      return true;
    }
    return false;
  }

  get imageFile() {
    return this.postForm.get('imageUpload.image').value;
  }

  ngOnInit(): void {
    this.postForm = new FormGroup({
      title: new FormControl(this.matData.title, [Validators.required, Validators.minLength(3)]),
      imageUpload: new FormGroup({
        image: new FormControl(this.matData.image, Validators.required),
        uploadOption: new FormControl('Upload', [Validators.required])
      }, [Validators.required, invalidImage]),
      content: new FormControl(this.matData.content, [Validators.required, Validators.minLength(8)]),
    });

    this.obSubs.push(
      this.postForm.get('imageUpload.uploadOption').valueChanges.subscribe(value => {
        if (value === 'URL') {
          this.resetImageOnOptionChange();
        }
      }));
    this.obSubs.push(this.postForm.get('imageUpload.image').valueChanges.subscribe(value => {
      const isUrl = this.postForm.get('imageUpload.uploadOption').value === 'URL';
      if (isUrl) {
        if (value) {
          const splitQueries = (value as string).split(/[?#]/)[0];
          if (value !== splitQueries) {
            this.postForm.get('imageUpload.image').setValue(value.split(/[?#]/)[0]);
          }
        }
      }
    }));
  }

  errorHandling(controlName: string, errorParam: string) {
    return this.postForm.get(controlName).hasError(errorParam);
  }

  onSubmit() {
    if (this.postForm.invalid) {
      return;
    }
    this.submitProgress = true;
    const postFormValues = this.getFormValue;
    const postValue: Post = {
      title: postFormValues.title,
      content: postFormValues.content,
      image: this.matData.image,
      createdDate: this.matData.createdDate,
      updatedDate: this.matData.updatedDate,
    };
    this.onSubmitting = true;
    this.submitObserver = this.submitForm(postValue);
    if (this.editedImage) {
      const imageFile = this.imageFile;
      this.submitObserver = this.onImageUploadPipe(imageFile, postValue);
    }
    this.submitSub = this.submitObserver
      .subscribe(response => {
        if (response === null) {
          return this.onSubmitErrorOccurred(['Bad Image URL']);
        }
        if (!response.success) {
          return this.onSubmitErrorOccurred(response.errors);
        }
        this.onSubmitted = true;
        setTimeout(() => {
          this.finishedDialog.next();
          this.postsService.onPostSubmitted.next();
        }, 2500);
      }, (error) => {
        this.onSubmitting = false;
        if (error && error.error && error.error.message) {
          return this.onSubmitErrorOccurred([error.error.message]);
        }
        this.onSubmitErrorOccurred(['Bad Request']);
      }, () => {
        this.onSubmitting = false;
      });
  }

  private onImageUploadPipe(imageFile: File | string, postValue: Post) {
    if (imageFile instanceof File) { // Image Upload
      const imageUpload = new FormData();
      imageUpload.append('image', imageFile, imageFile.name);
      return this.postsService.uploadImage(imageUpload)
        .pipe
        (
          switchMap((imagePath: string) => {
            postValue.image = imagePath;
            return this.submitForm(postValue);
          })
        );
    }
    // Image Url
    return this.postsService.uploadWithImageUrl(imageFile)
      .pipe
      (
        switchMap((imagePath: string) => {
          postValue.image = imagePath;
          return this.submitForm(postValue);
        })
      );
  }


  onImageUploaded(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files.length > 0 ? fileInput.files[0] : null;
    this.postForm.get('imageUpload.image').setValue(file);
    this.editedImage = true;
  }

  checkFormBeforeClose() {
    if (this.postForm.touched && this.postForm.dirty) {
      this.matDialog.open(ConfirmDialogComponent)
        .beforeClosed()
        .subscribe((result: boolean) => {
          if (result) {
            this.matDialogRef.close();
          }
        });
      return;
    }
    this.matDialogRef.close();
  }

  private onSubmitErrorOccurred(errors: string[]) {
    this.submitProgress = false;
    this.submitErrors = errors;
    this.onSubmitError = true;
    setTimeout(() => {
      this.resetErrors();
    }, 5000);
  }

  private submitForm(postValue: Post) {
    if (this.editMode) {
      return this.postsService.editPost(this.matData._id as string, postValue)
        .pipe(catchError((err) => {
          return of(null);
        }));
    }
    return this.postsService.createPost(postValue)
      .pipe(catchError(error => {
        return of(error.error);
      }));
  }

  private resetImageOnOptionChange() {
    this.postForm.get('imageUpload.image').setValue(null);
    this.editedImage = true;
  }

  private resetErrors() {
    this.submitErrors = [];
    this.onSubmitError = false;
  }

  ngOnDestroy() {
    for (const sub of this.obSubs) {
      sub.unsubscribe();
    }
  }
}
