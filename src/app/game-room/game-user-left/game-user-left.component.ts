import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-user-left',
  templateUrl: './game-user-left.component.html',
  styleUrls: ['./game-user-left.component.css']
})
export class GameUserLeftComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  // todo : html 문제인데, 이름이랑 id만 노출할 것이 아니라 자신의 그림도 함께 보여주는 게 좋을듯! 공간이 많이
  // todo 남기도하고, 게임방에서 이미지를 보여주지 않으면 대기방에서 이미지를 넣는 이유가 없기도하고. 대기방에서
  // todo 이미지 바꿀 수 있는 설정도 따로 만들어줘야할듯.
}
