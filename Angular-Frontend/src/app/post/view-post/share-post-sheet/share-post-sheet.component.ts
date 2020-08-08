import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {Observable} from 'rxjs';
import {Post} from '../../../models/Post';

@Component({
  selector: 'app-share-post-sheet',
  templateUrl: './share-post-sheet.component.html',
  styleUrls: ['./share-post-sheet.component.scss']
})
export class SharePostSheetComponent implements OnInit {

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) private data: Observable<Post>,
              private bottomSheetRef: MatBottomSheetRef) {
  }

  ngOnInit(): void {

  }

  copyToClipboard() {
    this.bottomSheetRef.dismiss();
  }
}
