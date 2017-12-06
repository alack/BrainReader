import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  chk;
  color = 'primary';
  progress_value = 50;
  mode = 'query';
  bufferValue = 75;
  problem_word = '0 0 0 0 0';
  readys;
  word;

  constructor(private gameIo: GameIoService) { }

  // todo 시간 계산해서 표시해줄 곳
  // todo 시간 표시도 여기서 해줄 것이야. 문자를 보여주는 것과 줄어드는 것을 따로 보여줄거야.
  // todo 단어 최하단, 바 시간바로위, 디지털 시간, 현재 판수, 가장 위에 게임 시작, ready를 함께 두고 방장일경우 시작버튼이 보이게 방장이 아닐경우 ready버튼이 보이게 함.
  // todo 그래서 모두 ready 상태가 되면 게임이 시작됨.
  ngOnInit() {
    this.getWord();
    // 정답이라면 단어 삭제한다.
    this.readys = this.gameIo.jeongDab().subscribe(data => {
      this.problem_word = '0 0 0 0 0';
    });
    // this.gameIo
  }

  // todo 게임 시작, 한 문제 시간이 끝나거나 문제를 맞추거나 하면 작동하는 것으로 바꿀 예정 이것은 어떻게 구현할지 생각중.
  // todo 정답을 맞췄다는 알림은 가는데 유저가 아니라서 안됨.
  getWord() {
    this.gameIo.getWord().subscribe(data => {
      console.log('game.ts::getWord::getWord subscribe event data[result] : ', data['result'], ' data[word] ', data['word']);
      if (data['result'] === 'success') {
        this.problem_word = data['word'];
      }
    });
  }
  ready() {
    // todo ㄹㄷ를 누르면 다른사람에 ㄹㄷ했다고 알리는 서비스의 함수를 호출한다.
  }

}
