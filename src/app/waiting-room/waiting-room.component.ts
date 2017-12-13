import { Component, OnInit, OnDestroy } from '@angular/core';
import { Room } from '../../../models/room';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { GameIoService } from '../service/game-io.service';
import {SessionService} from '../service/session.service';

@Component({
  selector: 'lobby',
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})

export class WaitLobbyComponent implements OnInit, OnDestroy {
  rooms: Object[];

  constructor(private http: HttpClient,
              public dialog: MatDialog,
              private gameIo: GameIoService,
              private sessionService: SessionService) {}

  ngOnInit(): void {
    console.log('lobby init');
    this.gameIo.setRoomId(0);
    this.gameIo.joinRoom();
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.rooms = data['result'];
    });
  }

  ngOnDestroy() {
    console.log('lobby destroyed');
    this.gameIo.leaveRoom();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreateRoom, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.http.post('/room', {data: result}).subscribe(data => {
          if(data['result'] == 'ok'){
            this.http.post('/room/' + result['name'], {
              data: this.sessionService.getSessionId()
            }).subscribe(dat => {
              console.log('create room', result);

              this.gameIo.setRoomId(result['name']);
              this.sessionService.setCurrentPage('game');
            });
          } else {
              alert('이미 존재하는 방 제목입니다.!');
          }
        });
      }
      console.log('The dialog was closed');
    });
  }

  openRank() {
    const dialogRef = this.dialog.open(Rank, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'create-room',
  templateUrl: './wait-createRoom.dialog.html'
})
export class CreateRoom {
  room: Room = {
    name: '',
    password: '',
    type: 'All',
    maxUser: 8,
    users: [],
    painter: '',
    mode: false,
    gamecnt: 1,
    curcnt: 0,
    timeOut: 10,
    remainSec: 10
  };
  formisvalid = true;
  constructor(public dialogRef: MatDialogRef<CreateRoom>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyDown() {
    if(this.room.name.length > 0)
      this.formisvalid = false;
    else
      this.formisvalid = true;
  }

}

@Component({
  selector: 'rank',
  template: `
      <mat-list dense>
          <mat-list-item *ngFor="let user of users; let i = index" [attr.data-index]="i">
            <div style="display:flex;justify-content: space-between; width: 100%">
              <div> {{i+1}}위 </div>
              <div> {{user.id}} </div>
              <div> {{user.points}} </div>
            </div>
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
