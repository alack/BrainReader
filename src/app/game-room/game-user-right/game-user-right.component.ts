import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-game-user-right',
  templateUrl: './game-user-right.component.html',
  styleUrls: ['./game-user-right.component.css']
})
export class GameUserRightComponent implements OnInit {
  @Input() rightusers = [];
  @Input() startflag = false;
  constructor() {}

  ngOnInit() {
  }
}
