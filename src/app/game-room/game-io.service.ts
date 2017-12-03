import { Injectable, OnInit } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GameIoService implements OnInit {
  private url = 'http://localhost:3000';
  public socket;
  roomId = '0';
  constructor() {
    this.socket = io(this.url);
    // this.joinRoom();
  }

  ngOnInit() {
    console.log('game-io service ngOnInit!!');
  }
  joinRoom() {
    console.log('joinRoom.service function');
    const data = { name : '',
                    roomId : this.roomId };
    this.socket.emit('joinroom', data);
  }
  sendMessage(message) {
    console.log('sendMessage.service function');
    const data = {
      roomId: this.roomId,
      message: message
    };
    this.socket.emit('send:message', data);
  }
  getMessages() {
     const observable = new Observable(observer => {

      this.socket.on('message', (data) => {
        console.log('getMessages.service::send:message event coming');
        observer.next(data);
      });
      return () => {
        this.socket.leave();
        this.socket.disconnect();
      };
    });
    return observable;
  }
  sendStartLine(data) {
    console.log('sendStartLine.service function');
    this.socket.emit('startline', {roomId : this.roomId,
    x : data.x,
    y : data.y });
  }
  getStartPath() {
    const observable = new Observable(observer => {

      this.socket.on('startpath', (data) => {
        console.log('getStartPath.service::startpath event coming');
        observer.next(data);
      });
      return () => {
        this.socket.leave();
        this.socket.disconnect();
      };
    });
    return observable;
  }
  sendMoveLine(data) {
    console.log('sendMoveLine.service function');
    this.socket.emit('moveline', {roomId : this.roomId,
      x : data.x,
      y : data.y });
  }
  getMovePath() {
    const observable = new Observable(observer => {

      this.socket.on('movepath', (data) => {
        console.log('getMovePath.service::movepath event coming');
        observer.next(data);
      });
      return () => {
        this.socket.leave();
        this.socket.disconnect();
      };
    });
    return observable;
  }
  sendFinishLine(data) {
    console.log('sendFinishLine.service function');
    this.socket.emit('finishline', {roomId : this.roomId,
      x : data.x,
      y : data.y });
  }
  getFinishPath() {
    const observable = new Observable(observer => {

      this.socket.on('finishpath', (data) => {
        console.log('getFinishPath.service::finishpath event coming');
        observer.next(data);
      });
      return () => {
        this.socket.leave();
        this.socket.disconnect();
      };
    });
    return observable;
  }
  getNewUser() {
    // todo : 새로룸에 접속한 유저의정보를 확인하고 일반적으로는 left에 넘겨주되 left, right의 유저수를 고려하여 적은 곳으로 넘김 받은 data에 direction이란 parameter를 추가하여 넘긴다. 그러면 component는 자기에 해당한다면 추가하도 아니라면 하지 않는다. 맡김(이 함수는 waitingroom에도 있어야할 것)
  }
  requestWord() {
    // todo : 게임을 시작하고난 이후 새 단어를 요청함
  }
  getWord() {
    // todo : 새 단어를 받음.
  }

}
