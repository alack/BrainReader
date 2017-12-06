import { Injectable, OnInit, OnDestroy } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../service/session.service';

@Injectable()
export class GameIoService implements OnInit {
  private url = 'http://localhost:3000';
  private roomId = '0';
  private roomLeftUser = [];
  private roomRightUser = [];
  public socket;
    constructor(private sessionService: SessionService,
                private http: HttpClient) {
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
    this.socket.emit('getuserlist', this.roomId);
    console.log('requestuserlist to room' + this.roomId);
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
        if (this.roomLeftUser.length > this.roomRightUser.length) {
          this.roomRightUser.push(data);
          data.dir = 1;
        } else {
          this.roomLeftUser.push(data);
          data.dir = 0;
        }
        observer.next(data);
      });
    });
    return observable;
  }
  getWord() {
    return this.http.get('/word/word?roomId=' + this.roomId);
  }
  getReady() {
    const observable = new Observable(observer => {

      this.socket.on('ioready', (data) => {
        console.log('gameIoService::ready event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
    // todo 다른사람이 ㄹㄷ하면 여기서 수신받아서 해당하는 id를 가진 사람의 card의 색을 바꾼다.
    // todo 모두가 ㄹㄷ하면 시작하는 것으로 생각했는데 이걸 어떻게 판단해야 모두가 레디하면 바로 시작할까?
  }
  sendReady() {
    console.log('gameIoService::sendReady');
    const data = {};
    this.socket.emit('serverready', data);
    // 해당 유저가 ㄹㄷ했다는 신호를 보내는 곳이다. 딱히 변경할 필요가 있는가....?
  }

  drawingAuthRemove() {
      // 드로잉 권한 삭제 trigger
    const observable = new Observable(observer => {

      this.socket.on('drawingauthremove', (data) => {
        console.log('gameIoService::drawingauthremove event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  jeongDab() {
      // todo 그림 삭제
    const observable = new Observable(observer => {

      this.socket.on('jeongdab', (data) => {
        console.log('gameIoService::jeongdab event coming');
        if (this.sessionService.getSessionId() === data.dangchum) {
          data.dangchum = true;
        } else {
          data.dangchum = false;
        }
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  nextHuman() {
      // 드로잉 권한 부여, 단어 불러오기 트리거 발동
    const observable = new Observable(observer => {

      this.socket.on('nexthuman', (data) => {
        console.log('gameIoService::nexthuman event coming');
        this.getWord();
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
}
