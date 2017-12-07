import { Component, OnInit, OnDestroy } from '@angular/core';
import { Room } from '../../../../models/room';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GameIoService } from '../../service/game-io.service';
import {SessionService} from '../../service/session.service';

@Component({
  selector: 'lobby',
  templateUrl: 'wait-lobby/wait-lobby.component.html',
  styleUrls: ['wait-lobby/wait-lobby.component.css']
})

export class WaitLobbyComponent implements OnInit, OnDestroy {
  rooms: Object[];

  constructor(private http: HttpClient,
              public dialog: MatDialog,
              private gameIo: GameIoService,
              private sessionService: SessionService) {}

  ngOnInit(): void {
    console.log('lobby init');
    this.gameIo.joinRoom();
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.rooms = data['result'];
    });
  }

  ngOnDestroy() {
    console.log('lobby destroyed');
    // TODO 전에 있던 방 ID 로 해야함
    this.gameIo.requestUserList();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateRoom, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.http.post('/room', {data: result}).subscribe(data => {
        this.http.post('/room/' + result['name'], {
          data: this.sessionService.getSessionId()
        }).subscribe(dat => {
          console.log('create room', result);

          this.gameIo.setRoomId(result['name']);
          this.sessionService.setCurrentPage('game');
        });
      });
      console.log('The dialog was closed');
    });
  }

  openRank() {
    const dialogRef = this.dialog.open(Rank, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'create-room',
  templateUrl: '../wait-createRoom.dialog.html'
})
export class CreateRoom {
  room: Room = {
    name: '',
    password: '',
    type: '',
    maxUser: 8,
    userCount: 0,
    users: [],
    painter: ''
  };

  constructor(public dialogRef: MatDialogRef<CreateRoom>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'rank',
  template: `
      <mat-list dense>
          <mat-list-item *ngFor="let user of users">
              {{user.id}} - {{user.points}}
          </mat-list-item>
      </mat-list>`
})

export class Rank implements OnInit {
  users: Object[];

  constructor(private http: HttpClient,
              public dialogRef: MatDialogRef<Rank>) { }

  ngOnInit() {
    this.http.get('/user/rank').subscribe(data => {
      // Read the result field from the JSON response.
      this.users = data['result'];
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
