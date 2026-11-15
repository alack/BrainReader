import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-game-user-left',
  templateUrl: './game-user-left.component.html',
  styleUrls: ['./game-user-left.component.css']
})
export class GameUserLeftComponent implements OnInit {
  @Input() leftusers = [];
  @Input() startflag = false;
  constructor() {}

  ngOnInit() {
  }
}
