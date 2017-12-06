import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameIoService } from '../service/game-io.service';
import { SessionService } from '../service/session.service';

@Component({
  selector : 'common-chat',
  templateUrl : './common-chat.component.html',
  styleUrls: ['./common-chat.component.css']
})

export class ChatComponent implements OnInit, OnDestroy {
  messages = [];
  name;
  con_chat;
  value;

  constructor(private gameIo: GameIoService,
              private session: SessionService) {}

  ngOnInit() {
    // body component 에서 하는게 좋을듯??
    // this.gameIo.joinRoom();
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
