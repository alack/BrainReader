import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameIoService } from '../service/game-io.service';
import { SessionService } from '../service/session.service';

@Component({
  selector : 'app-chatting-component',
  templateUrl : './wait.chatting-component.html',
  styleUrls: ['./wait.chatting-component.css']
})

export class WaitChattingComponent implements OnInit, OnDestroy {
  messages = [];
  name;
  con_chat;
  value;

  constructor(private gameIo: GameIoService,
              private session: SessionService) {}

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
    const chat_window = document.getElementById('game_room_chat_window');
    chat_window.scrollTop = chat_window.scrollHeight;
  }
}
