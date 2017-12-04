import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector: 'app-game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: ['./game-chat.component.css']
})

export class GameChatComponent implements OnInit, OnDestroy {
  messages = [];
  con_chat;
  value;
  constructor(private gameIo: GameIoService) { }

  ngOnInit() {
    this.gameIo.joinRoom();
    this.con_chat = this.gameIo.getMessages().subscribe(message => {
      this.pushMessages(message);
    });
  }

  ngOnDestroy() {
    this.con_chat.unsubscribe();
  }

  onEnter(value: string) {
    this.gameIo.sendMessage(value);
    this.value = '';
  }

  pushMessages(value)  {
    this.messages.push(value);
    if (this.messages.length > 50) {
      this.messages.splice(0, 1);
    }
  }
}
