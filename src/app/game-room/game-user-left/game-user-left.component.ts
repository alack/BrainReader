import {Component, Input, OnInit} from '@angular/core';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector: 'app-game-user-left',
  templateUrl: './game-user-left.component.html',
  styleUrls: ['./game-user-left.component.css']
})
export class GameUserLeftComponent implements OnInit {
  @Input() leftusers = [];
  constructor(private gameIo: GameIoService) {}

  ngOnInit() {
  }
}
