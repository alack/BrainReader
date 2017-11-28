import { Component, OnInit, Inject } from '@angular/core';
import { Room } from '../../../models/room';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';

@Component({
  selector: 'lobby',
  templateUrl: 'wait.lobby-component.html',
  styleUrls: ['wait.lobby-component.css']
})

export class WaitLobbyComponent implements OnInit {
  title = 'app';
  rooms: Object[];
  private url = 'http://localhost:3000';
  private socket = io(this.url);

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(): void {
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.rooms = data['result'];
    });
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(CreateRoom, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      this.socket.emit('createroom', result);
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
    max: 8,
    user: 1
  };

  constructor(public dialogRef: MatDialogRef<CreateRoom>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
