import {Component, OnInit} from '@angular/core';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  color = 'primary';
  progress_value = 100;
  max_value = 100;
  mode = 'progress';
  bufferValue = 75;
  problem_word = '0 0 0 0 0';
  readys;
  word;
  nexthuman;
  updateSec;
  sec = 0;
  start;
  startflag = false;
  end; // todo 겜이 끝나는 걸 감시할 옵저버 end가 오면 startflag를 false로 바꿈.
  constructor(private gameIo: GameIoService) { }

  // 시간 계산해서 표시해줄 곳
  // 시간 표시도 여기서 해줄 것이야. 문자를 보여주는 것과 줄어드는 것을 따로 보여줄거야.
  // 단어 최하단, 바 시간바로위, 디지털 시간, 현재 판수, 가장 위에 게임 시작, ready를 함께 두고 방장일경우 시작버튼이 보이게 방장이 아닐경우 ready버튼이 보이게 함.
  // 그래서 모두 ready 상태가 되면 게임이 시작됨.
  ngOnInit() {
    // 정답이라면 단어 삭제한다.
    this.start = this.gameIo.gameStart().subscribe( () => {
      this.gameStart();
    });
    this.end = this.gameIo.gameEnd().subscribe( () => {
      this.gameEnd();
    });
  }

  // 게임 시작, 한 문제 시간이 끝나거나 문제를 맞추거나 하면 작동하는 것으로 바꿀 예정
  getWord() {
    this.gameIo.getWord().subscribe(data => {
      console.log('game.ts::getWord::getWord subscribe event data[result] : ', data['result'], ' data[word] ', data['word']);
      if (data['result'] === 'success') {
        this.problem_word = data['word'];
      }
    });
  }

  gameStart() {
    this.readys = this.gameIo.wordRemove().subscribe(() => {
      this.problem_word = '0 0 0 0 0';
    });
    this.nexthuman = this.gameIo.nextHuman().subscribe(() => {
      this.getWord();
    });
    this.updateSec = this.gameIo.updateSec().subscribe( data => {
      console.log(data);
      this.sec = data['remainSec'];
      if ( data['timeOut'] ) {
        this.max_value = data['timeOut'];
      }
      this.progress_value = (this.sec / this.max_value) * 100;
    });
    this.startflag = true;
  }

  gameEnd() {
    this.startflag = false;
    this.readys.unsubscribe();
    this.nexthuman.unsubscribe();
    this.updateSec.unsubscribe();
  }

  ready() {
    // ㄹㄷ를 누르면 다른사람에 ㄹㄷ했다고 알리는 서비스의 함수를 호출한다.
    if (!this.startflag) {
      this.gameIo.sendReady();
    }
  }

}
