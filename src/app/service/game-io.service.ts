import { Injectable, OnInit, OnDestroy } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import {SessionService} from '../service/session.service';

@Injectable()
export class GameIoService implements OnInit {
  private url = 'http://localhost:3000';
  public socket;
  roomId = '0';
  roomLeftCnt = 0;
  roomRightCnt = 0;
  constructor(private sessionService: SessionService) {
    this.socket = io(this.url);
    // this.joinRoom();
  }

  ngOnInit() {
    console.log('game-io service ngOnInit!!');
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

  setRoomId(id){
    this.roomId = id;
  }

  getRoomId(id) {
    return this.roomId;
  };

  joinRoom() {
    console.log('joinRoom.service function');
    console.log(this.socket);
    const data = { userName : this.sessionService.getSessionId(),
                    roomId : this.roomId };

    this.socket.emit('joinroom', data);
    console.log('joinRoom to ', data);
    this.requestUserList();
  }


  sendMessage(message) {
    console.log('sendMessage.service function');
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
        console.log('getMessages.service::send:message event coming', data);
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
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
        // this.socket.leave();
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
        // this.socket.leave();
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
        // this.socket.leave();
        this.socket.disconnect();
      };
    });
    return observable;
  }
  getNewUser() {
    const observable = new Observable(observer => {
      this.socket.on('person_join', function (data){
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
    // todo 맡김(이 함수는 waitingroom에도 있어야할 것)
  }
  requestWord() {
    // todo : 게임을 시작하고난 이후 새 단어를 요청함
  }
  getWord() {
    // todo : 새 단어를 받음.
  }
}
