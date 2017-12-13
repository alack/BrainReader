import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameIoService } from '../service/game-io.service';
import {HttpClient} from "@angular/common/http";

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

  constructor(public gameIo: GameIoService, private http : HttpClient) {  }

  ngOnInit() {
    this.gameIo.joinRoom();
    this.gameIo.getNewUser().subscribe((data) => {
      console.log('both users push push!!' +
        'left : ', data['left'],
        'right : ', data['right']);

      data['left'].forEach(result => {
        this.http.get('/user/' + result.userName + '/image').subscribe( res =>{
          this.leftusers.push(res);
        });
      });

      data['right'].forEach(result => {
        this.http.get('/user/' + result.userName + '/image').subscribe( res =>{
          this.rightusers.push(res);
        });
      });
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
