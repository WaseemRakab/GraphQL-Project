import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  constructor(private matDialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }


  confirm(answer: boolean) {
    this.matDialogRef.close(answer);
  }
}
