import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  color = 'primary';
  progress_value = 50;
  mode = 'query';
  bufferValue = 75;
  constructor() { }

  // todo requestWord를 호출 할 곳, getWord를 subscribe할 곳, 시간 계산해서 표시해줄 곳
  // todo 채팅 기록을 가져와서(어떻게 가져올까..) 정답인지 아닌지 파악하기. 맞으면 문제 주도권 넘기기
  // todo 문제 주도권 부여를 여기서 하자. 시간 표시도 여기서 해줄 것이야. 문자를 보여주는 것과 줄어드는 것을 따로 보여줄거야.
  // todo 게임 시작 버튼을 어디다 위치시켜야할까. 이걸 또 고민해봐야 될 듯.
  // todo 단어 최하단, 바 시간바로위, 디지털 시간, 현재 판수, 가장 위에 게임 시작, ready를 함께 두고 방장일경우 시작버튼이 보이게 방장이 아닐경우 ready버튼이 보이게 함.
  // todo 그래서 모두 ready 상태가 되고 시작버튼을 누르면 게임이 시작됨.
  ngOnInit() {
  }

}
