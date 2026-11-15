
import {Component, Inject, Input, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatDialog, MatDialogRef} from '@angular/material';
import {GameIoService} from '../../../service/game-io.service';
import {SessionService} from '../../../service/session.service';
import {Room} from '../../../../../models/room';


@Component({
  selector: 'app-room-update',
  templateUrl: './update-room.component.html',
  styleUrls: ['/update-room.component.css']
})
export class UpdateRoomComponent implements OnInit {


  constructor(private http: HttpClient,
              public dialog: MatDialog,
              private gameIo: GameIoService,
              private sessionService: SessionService) {}
  ngOnInit(): void {
  }

  openUpdateDialog(): void {
    const dialogRef = this.dialog.open(UpdateRoomModalComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result update');
      console.log(result);
      if(result) {
        this.http.put('/room/', {room: result}).subscribe(data => {

          console.log('room update at the client');
        });
      }
      console.log('The dialog was closed');
    });
  }
}

@Component({
  selector: 'app-update-room-modal',
  templateUrl: './updateRoom.dialog.html'
})
export class UpdateRoomModalComponent implements OnInit{
  room: Room = {
    name: '',
    password: '',
    type: 'All',
    maxUser: 4,
    users: [],
    painter: '',
    mode: false,
    gamecnt: 1,
    curcnt: 0,
    timeOut: 5,
    remainSec: 5
  };

  constructor(public dialogRef: MatDialogRef<UpdateRoomModalComponent>,
              private httpClient: HttpClient,
              private gameIo: GameIoService) { }

  ngOnInit(): void {
    console.log('check correct getRoom Name ::  '  + this.gameIo.getRoomId());
    this.httpClient.get('/room/' + this.gameIo.getRoomId()).subscribe(result => {
    this.room = result['result'];
    });
  }

  onNoClick1(): void {
    this.dialogRef.close();
  }

}
