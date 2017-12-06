import {Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {SessionService} from '../service/session.service';

/**
 * @title Dialog Overview
 */
@Component({
  selector: 'app-start-page',
  templateUrl: './startComponent.html',

})
export class StartComponent {
  sessionId: string;
  currentPage;

  constructor(public dialog: MatDialog,
              public sessionService: SessionService) {

  }

  openDialog(): void {

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      height: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {

      this.sessionId = this.sessionService.getSessionId();
      this.currentPage = this.sessionService.getCurrentPage();

    });
  }

}

@Component({
  selector: 'app-start-dialog',
  templateUrl: './start-dialog.html',
})
export class DialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
