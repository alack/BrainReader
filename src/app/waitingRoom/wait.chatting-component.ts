import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from './wait.chatting-service';
import * as io from 'socket.io-client';

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
  // private url = 'http://localhost:3000';
  // private socket = io(this.url);

  constructor(private chatService:ChatService) {}

  sendMessage(){
    this.chatService.sendMessage(this.message);
    // let data = {
    //   roomId: '',
    //   message: this.message
    // }
    // this.socket.emit('send:message', )
  }

  ngOnInit(): void {
    this.chatService.joinRoom();
    this.connection = this.chatService.getMessages().subscribe( message => {
      console.log('push',message);
      // console.log(this.messages)
      this.messages.push(message);
    })

    // this.socket.emit('joinroom', { name: '' });
    // this.socket.on('send:message', (data) => {
    //   this.messages.push(data)
    // })
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

}
