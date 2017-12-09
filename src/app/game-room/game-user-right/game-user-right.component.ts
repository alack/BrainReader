import {Component, Input, OnInit} from '@angular/core';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector: 'app-game-user-right',
  templateUrl: './game-user-right.component.html',
  styleUrls: ['./game-user-right.component.css']
})
export class GameUserRightComponent implements OnInit {
  @Input() rightusers = [];
  constructor(private gameIo: GameIoService) {}

  ngOnInit() {
  }
}
