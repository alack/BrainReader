
import {Component, OnInit} from '@angular/core';
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

    // todo cancel 경우도 해결
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
}

@Component({
  selector: 'app-update-room-modal',
  templateUrl: './updateRoom.dialog.html'
})
export class UpdateRoomModalComponent {
  room: Room = {
    name: '',
    password: '',
    type: '1',
    maxUser: 4,
    userCount: 0,
    users: [],
    painter: '',
    mode: false,
    gamecnt: 1, // todo
    curcnt: 0,
    timeOut: 5, // todo
    remainSec: 5
  };

  constructor(public dialogRef: MatDialogRef<UpdateRoomModalComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
