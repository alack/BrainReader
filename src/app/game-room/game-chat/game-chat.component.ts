import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-chat',
  templateUrl: './game-chat.component.html',
  styleUrls: ['./game-chat.component.css']
})
export class GameChatComponent implements OnInit {
  messages = [];
  constructor() { }

  ngOnInit() {
  }

  onEnter(value: string) {
    this.messages.push(value);
    if (this.messages.length > 50) {
      this.messages.splice(0, 1);
    }
    const chat_window = document.getElementById('game_room_chat_window');
    chat_window.scrollTop = chat_window.scrollHeight;
  }
}
