import { Injectable, OnInit, OnDestroy } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import {SessionService} from '../service/session.service';

@Injectable()
export class GameIoService implements OnInit {
  private url = 'http://localhost:3000';
  private roomId = '0';
  private roomLeftCnt = 0;
  private roomRightCnt = 0;
  public socket;
    constructor(private sessionService: SessionService) {
    this.socket = io(this.url);
    // this.joinRoom();
  }

  ngOnInit() {
    console.log('gameIoService::ngOnInit');
  }

  getUserList() {
    const observable = new Observable(observer => {
      this.socket.on('getuserlist', (data) => {
        console.log('getUserList.service::getuserlist event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }

  requestUserList() {
    this.socket.emit('getuserlist',this.roomId);
    console.log('requestuserlist to room'+this.roomId)
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
    console.log(this.socket);
    const data = { userName : this.sessionService.getSessionId(),
                    roomId : this.roomId };

    this.socket.emit('joinroom', data);
    console.log('joinRoom to ', data);
    this.requestUserList();
  }


  sendMessage(message) {
    console.log('gameIoService::sendMessage');
    const data = {
      roomId: this.roomId,
      message: message
    };
    console.log(data);
    this.socket.emit('send:message', data);
  }
  getMessages() {
     const observable = new Observable(observer => {

      this.socket.on('message', (data) => {
        console.log('gameIoService::send:message event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
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
        // this.socket.leave();
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
        // this.socket.leave();
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
        // this.socket.leave();
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
