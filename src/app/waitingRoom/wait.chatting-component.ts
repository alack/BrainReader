import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from './wait.chatting-service';
import {SessionService} from '../service/session.service';

@Component({
  selector : 'app-chatting-component',
  templateUrl : './wait.chatting-component.html',
  styleUrls: ['./wait.chatting-component.css'],
  providers: [ChatService]
})

export class WaitChattingComponent implements OnInit, OnDestroy {
  messages = [];
  connection;
  message;
  name;

  constructor(private chatService:ChatService,
              private sessionService: SessionService) {}

  sendMessage(keyCode){
    if(keyCode == 13) {
      this.chatService.sendMessage({
        name: this.name,
        message: this.message
      });
      this.message = '';
    }
  }

  ngOnInit(): void {
    this.name = this.sessionService.getSessionId();
    this.chatService.joinRoom();
    this.connection = this.chatService.getMessages().subscribe( data => {
      this.messages.push(data);
    })
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
