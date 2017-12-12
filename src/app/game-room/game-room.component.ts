import { Component, OnInit } from '@angular/core';
import { GameIoService } from '../service/game-io.service';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {
  leftusers = [];
  rightusers = [];
  start;
  startflag = false;

  constructor(public gameIo: GameIoService) {  }

  ngOnInit() {
    this.gameIo.joinRoom();
    this.gameIo.getNewUser().subscribe((data) => {
      console.log('both users push push!!' +
        'left : ', data['left'],
        'right : ', data['right']);
      this.leftusers = data['left'];
      this.rightusers = data['right'];
    });
    this.gameIo.gameStart().subscribe( () => {
      this.startflag = true;
    });
    this.gameIo.gameEnd().subscribe( () => {
      this.startflag = false;
    });
  }
}
