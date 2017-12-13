import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameIoService } from '../service/game-io.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit, OnDestroy {
  leftusers = [];
  rightusers = [];
  start;
  startflag = false;

  constructor(public gameIo: GameIoService, public http: HttpClient) {  }

  ngOnInit() {
    this.gameIo.joinRoom();
    this.gameIo.getNewUser().subscribe((data) => {
      console.log('both users push push!!' +
        'left : ', data['left'],
        'right : ', data['right']);
      const left = [], right = [];
      data['left'].forEach( l => {
        this.http.get('/user/' + l.userName + '/findUser').subscribe(res => {
          left.push(res);
          this.leftusers = left;
        });
      });
      this.leftusers = left;
      data['right'].forEach(r => {
        this.http.get('/user/' + r.userName + '/findUser').subscribe(res => {
          right.push(res);
          this.rightusers = right;
        });
      });
      this.rightusers = right;
    });
    this.gameIo.gameStart().subscribe( () => {
      this.startflag = true;
    });
    this.gameIo.gameEnd().subscribe( () => {
      this.startflag = false;
    });
  }

  ngOnDestroy() {
    this.gameIo.leaveRoom();
  }
}
