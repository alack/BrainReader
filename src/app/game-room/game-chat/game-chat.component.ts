import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameIoService } from '../game-io.service';

@Component({
  selector: 'app-game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: ['./game-chat.component.css']
})

export class GameChatComponent implements OnInit, OnDestroy {
  messages = [];
  con_chat;
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
  }

  pushMessages(value) {
    this.messages.push(value);
    if (this.messages.length > 50) {
      this.messages.splice(0, 1);
    }
    const chat_window = document.getElementById('game_room_chat_window');
    chat_window.scrollTop = chat_window.scrollHeight;
  }
}
