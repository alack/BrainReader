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
  painter = '';
  constructor(public gameIo: GameIoService, public http: HttpClient) {  }

  ngOnInit() {
    this.gameIo.joinRoom();
    this.gameIo.getNewUser().subscribe((data) => {
      console.log('both users push push!!' +
        'left : ', data['left'],
        'right : ', data['right']);
      const left = [], right = [];
      data['left'].forEach( (l, lidx) => {
        this.http.get('/user/' + l.userName + '/findUser').subscribe(res => {
          res['painter'] = res['id'] == this.painter ? true : false;
          res['ready'] = data['left'][lidx].ready;
          console.log('leftuser : ', res);
          left.push(res);
          this.leftusers = left;
        });
      });
      this.leftusers = left;
      data['right'].forEach((r, ridx) => {
        this.http.get('/user/' + r.userName + '/findUser').subscribe(res => {
          res['painter'] = res['id'] == this.painter ? true : false;
          res['ready'] = data['right'][ridx].ready;
          console.log('leftuser : ', res);
          right.push(res);
          this.rightusers = right;
        });
      });
      this.rightusers = right;
    });
    this.gameIo.gameStart().subscribe( () => {
      console.log('gamestart to startflag live');
      this.startflag = true;
    });
    this.gameIo.gameEnd().subscribe( () => {
      console.log('gameend to startflag dead');
      this.startflag = false;
    });
    this.gameIo.painterChk().subscribe(res => {
      this.painter = res['painter'];
    });
  }

  ngOnDestroy() {
    this.gameIo.leaveRoom();
  }
}
