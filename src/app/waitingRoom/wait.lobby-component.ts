import { Component, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'lobby',
  templateUrl: 'wait.lobby-component.html',
  styleUrls: ['wait.lobby-component.css']
})

export class WaitLobbyComponent implements OnInit {
  title = 'app';
  rooms: Object[];

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(): void {
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.rooms = data['result'];
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateRoom, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.http.post('/room', {data: result}).subscribe(data => {
        console.log(data);
      });
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'create-room',
  templateUrl: './wait.createRoom-dialog.html'
})
export class CreateRoom {
  room: Room = {
    name: '',
    password: '',
    type: '',
    maxUser: 8,
    userCount: 1
  };

  constructor(public dialogRef: MatDialogRef<CreateRoom>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
