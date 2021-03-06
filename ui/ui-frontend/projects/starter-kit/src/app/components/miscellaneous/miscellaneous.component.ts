import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SampleDialogComponent } from './sample-dialog/sample-dialog.component';

const INFINITE_SCROLL_FAKE_DELAY_MS = 1500;

@Component({
  selector: 'app-miscellaneous',
  templateUrl: './miscellaneous.component.html',
  styleUrls: ['./miscellaneous.component.scss'],
})
export class MiscellaneousComponent implements OnInit {
  infiniteValues: number[] = [1, 2, 3, 4, 5];
  infiniteScrollDisabled = false;
  scrollLastValue = 6;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  openDialog() {
    this.dialog
      .open(SampleDialogComponent, { panelClass: 'vitamui-modal', disableClose: true })
      .afterClosed()
      .subscribe(() => {
        console.log('Dialog closed !');
      });
  }

  onScroll() {
    this.infiniteScrollDisabled = true;
    setTimeout(() => {
      this.infiniteScrollDisabled = false;
      this.infiniteValues = this.infiniteValues.concat([
        this.scrollLastValue++,
        this.scrollLastValue++,
        this.scrollLastValue++,
        this.scrollLastValue++,
        this.scrollLastValue++,
      ]);
    }, INFINITE_SCROLL_FAKE_DELAY_MS);
  }
}
