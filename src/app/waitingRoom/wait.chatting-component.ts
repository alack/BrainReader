import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ChatService } from './wait.chatting-service';

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
  @Input() name;

  constructor(private chatService:ChatService) {}

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
    this.chatService.joinRoom();
    this.connection = this.chatService.getMessages().subscribe( data => {
      this.messages.push(data);
    })

    this.messages.push({
      name: 'ghdekdan21',
      message: 'hihi nayana'
    })
    this.messages.push({
      name: 'ghdekdan21',
      message: 'hihi nayanahihi nayanahihi '
    })
    this.messages.push({
      name: 'ghdekdan21',
      message: 'hihi nayana'
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
