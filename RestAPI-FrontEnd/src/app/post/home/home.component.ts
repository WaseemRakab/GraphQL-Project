import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PostDialogComponent} from '../post-dialog/post-dialog.component';
import {map} from 'rxjs/operators';
import {AuthService} from '../../auth/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  statusUpdateForm: FormGroup;
  dialogRef: MatDialogRef<PostDialogComponent>;

  private dialogSub: Subscription;
  private statusSub: Subscription;

  constructor(public dialog: MatDialog,
              private authService: AuthService) {
  }

  get statusControl() {
    return this.statusUpdateForm.get('status') as FormControl;
  }

  get statusInvalid() {
    const control = this.statusControl;
    return control.invalid && control.dirty && control.touched;
  }

  get getFormValue() {
    return this.statusUpdateForm.value as { status: string };
  }

  ngOnInit(): void {
    this.statusUpdateForm = new FormGroup({
      status: new FormControl(null, Validators.required)
    });
    this.statusSub = this.authService.getUserStatus()
      .pipe(
        map(response => {
          return response.status;
        })
      ).subscribe(status => {
        this.statusControl.setValue(status);
      });
  }

  submitPost() {
    // update currentPost
  }

  openDialog() { // new Post Dialog
    this.dialogRef = this.dialog.open(PostDialogComponent, {disableClose: true, width: '600px'});
    const dialogComp = this.dialogRef.componentInstance;
    this.dialogSub = dialogComp.finishedDialog.subscribe(() => {
      this.dialogRef.close();
    });
  }

  ngOnDestroy(): void {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
    if (this.dialogSub) {
      this.dialogSub.unsubscribe();
    }
  }
}
