import { Injectable, OnInit } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GameIoService implements OnInit {
  private url = 'http://localhost:3000';
  private roomId = '0';
  private roomLeftCnt = 0;
  private roomRightCnt = 0;
  public socket;
  constructor(private http: HttpClient) {
    this.socket = io(this.url);
    // this.joinRoom();
  }

  ngOnInit() {
    console.log('gameIoService::ngOnInit');
  }

  setRoomId(id) {
    console.log('gameIoService::setRoomId');
    this.roomId = id;
  }

  getRoomId(id) {
    console.log('gameIoService::getRoomId');
    return this.roomId;
  }

  joinRoom() {
    console.log('gameIoService::joinRoom');
    const data = { name : '',
                    roomId : this.roomId };
    this.socket.emit('joinroom', data);
  }
  sendMessage(message) {
    console.log('gameIoService::sendMessage');
    const data = {
      roomId: this.roomId,
      message: message
    };
    this.socket.emit('send:message', data);
  }
  getMessages() {
     const observable = new Observable(observer => {

      this.socket.on('message', (data) => {
        console.log('gameIoService::send:message event coming');
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
    console.log('gameIoService::sendStartLine');
    this.socket.emit('startline', {roomId : this.roomId,
    x : data.x,
    y : data.y });
  }
  getStartPath() {
    const observable = new Observable(observer => {

      this.socket.on('startpath', (data) => {
        console.log('gameIoService::startpath event coming');
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
    console.log('gameIoServiec::sendMoveLine');
    this.socket.emit('moveline', {roomId : this.roomId,
      x : data.x,
      y : data.y });
  }
  getMovePath() {
    const observable = new Observable(observer => {

      this.socket.on('movepath', (data) => {
        console.log('gameIoService::movepath event coming');
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
    console.log('gameIoService::sendFinishLine');
    this.socket.emit('finishline', {roomId : this.roomId,
      x : data.x,
      y : data.y });
  }
  getFinishPath() {
    const observable = new Observable(observer => {

      this.socket.on('finishpath', (data) => {
        console.log('gameIoService::finishpath event coming');
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
    const observable = new Observable(observer => {
      this.socket.on('person_join', function (data){
        console.log('gameIoService::person_join event coming');
        if (this.roomLeftCnt <= this.roomRightCnt) {
          data.dir = 0;
          this.roomLeftCnt++;
        }
        else {
          data.dir = 1;
          this.roomRightCnt++;
        }
        observer.next(data);
      });
    });
    return observable;
  }
  getWord() {
    return this.http.get('/room/word');
  }
}
