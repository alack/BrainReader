import { Component, OnInit } from '@angular/core';
import { GameIoService } from '../service/game-io.service';

@Component({
  selector: 'app-game-room',
  templateUrl: './game-room.component.html',
  styleUrls: ['./game-room.component.css']
})
export class GameRoomComponent implements OnInit {


  constructor(private gameIo: GameIoService) {  }

  ngOnInit() {
    this.gameIo.joinRoom();
  }



}
