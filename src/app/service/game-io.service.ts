import {Injectable, OnInit} from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { SessionService } from './session.service';


@Injectable()
export class GameIoService implements OnInit {
  private url = 'http://localhost:3000';
  private roomId = '0';
  public LeftUser;
  public RightUser;
  private room = {
    id: this.roomId,
    leftUser: this.LeftUser,
    rightUser: this.RightUser,
    mode: false
  };
  public socket;
    constructor(private sessionService: SessionService,
                private http: HttpClient) {
    this.socket = io(this.url);
    this.LeftUser = [];
    this.RightUser = [];
    // this.joinRoom();
  }

  ngOnInit() {
    console.log('gameIoService::ngOnInit');
  }
  getRoom() {
      return this.room;
  }

  sendDraw(data) {
      data = {
        roomId : this.roomId,
        IMGbase64: data
      };
      return this.http.post('/draw', data);
  }

  getDraw() {
      return this.http.get('/draw?roomId=' + this.roomId);
  }

  getUserList() {
    let observable = new Observable(observer => {
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

  sendClear() {
    console.log('gameIoService::clearcanvas event send');
    this.socket.emit('clearcanvas');
  }

  getClear() {
    let observable = new Observable(observer => {

      this.socket.on('clearcanvas', () => {
        console.log('gameIoService::clearcanvas event coming');
        observer.next();
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }

  setRoomId(id) {
    console.log('gameIoService::setRoomId');
    this.roomId = id;
  }

  getRoomId() {
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
    // this.requestUserList();
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
     let observable = new Observable(observer => {

      this.socket.on('message', (data) => {
        console.log('gameIoService::message event coming');
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
    console.log('gameIoService::sendStartLine');
    this.socket.emit('startline', {roomId : this.roomId,
    x : data.x,
    y : data.y });
  }
  getStartPath() {
    let observable = new Observable(observer => {

      this.socket.on('startpath', (data) => {
        console.log('gameIoService::startpath event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
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
    let observable = new Observable(observer => {

      this.socket.on('movepath', (data) => {
        console.log('gameIoService::movepath event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
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
    let observable = new Observable(observer => {

      this.socket.on('finishpath', (data) => {
        console.log('gameIoService::finishpath event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  getNewUser() {
    let observable = new Observable(observer => {
      this.socket.on('gameroomuserlist', function (data) {
        console.log('gameIoService::gameroomuserlist event coming  ', data); // data가 이상한게 들어온다!!!
        if (data['users'] !== undefined) {
          const left = [], right = [];
          data['users'].forEach(
            (user, idx) => {
              if (idx % 2 == 0) {
                left.push(user);
                  console.log('roomLeftUser push!! idx : ', idx);
              } else {
                right.push(user);
                  console.log('roomRightUser push!! idx : ', idx);
              }
            });
          console.log({left: left, right: right});
          observer.next({ left: left, right: right });
          }
      });
    });
    return observable;
  }
  getWord() {
    return this.http.get('/word/word?roomId=' + this.roomId);
  }
  sendReady() {
    console.log('gameIoService::sendReady');
    const data = {};
    this.socket.emit('serverready', data);
    // 해당 유저가 ㄹㄷ했다는 신호를 보내는 곳이다. 딱히 변경할 필요가 있는가....?
  }
  gameStart() {
    let observable = new Observable(observer => {

      this.socket.on('gamestart', () => {
        console.log('gameIoService::gamestart event coming');
        observer.next();
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  drawingAuthRemove() {
      // 드로잉 권한 삭제 trigger
    let observable = new Observable(observer => {

      this.socket.on('drawingauthremove', () => {
        console.log('gameIoService::drawingauthremove event coming');
        observer.next();
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  picRemove() {
      // 그림 삭제
    let observable = new Observable(observer => {

      this.socket.on('PICremove', (data) => {
        console.log('gameIoService::picremove event coming currentUser : ', this.sessionService.getSessionId(),
          'picture capture User : ', data.dangchum);
        data.dangchum = this.sessionService.getSessionId() === data.dangchum;
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  wordRemove() {
    // 단어 삭제
    let observable = new Observable(observer => {

      this.socket.on('wordremove', () => {
        console.log('gameIoService::wordremove event coming');
        observer.next();
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
    let observable = new Observable(observer => {

      this.socket.on('nexthuman', (data) => {
        console.log('gameIoService::nexthuman event coming');
        if (data === this.sessionService.getSessionId()) {
          observer.next();
        }
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  updateSec() {
      // 시간 update 최초 시간은 timeout으로 지정되어 있으며 time은 실제 남은 시간을 말한다.
    let observable = new Observable(observer => {

      this.socket.on('updatesec', data => {
        console.log('gameIoService::updatesec event coming');
          observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  gameEnd() {
    let observable = new Observable(observer => {

      this.socket.on('gameend', () => {
        console.log('gameIoService::gameend event coming');
        observer.next();
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  getColor() {
    // 시간 update 최초 시간은 timeout으로 지정되어 있으며 time은 실제 남은 시간을 말한다.
    let observable = new Observable(observer => {

      this.socket.on('getcolor', data => {
        console.log('gameIoService::getcolor event coming');
        observer.next(data);
      });
      return () => {
        // this.socket.leave();
        // this.socket.disconnect();
      };
    });
    return observable;
  }
  sendColor (color) {
      this.socket.emit('sendcolor', color);
  }

}
