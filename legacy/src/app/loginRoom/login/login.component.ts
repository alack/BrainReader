
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HttpUserService} from '../../service/http-user.service';
import {DialogComponent} from '../start/start.component';
import {MatDialogRef} from '@angular/material';
import {SessionService} from '../../service/session.service';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  sendUser: EventEmitter<void> = new EventEmitter<void>();

  userId: string;
  userPassword: string;
  session: boolean;
  sessId: string;
  validation = true;  // true 이면 로그인 버튼 비활성화

  user = {
    sessionId: '',
    currentPage: ''
  };

  constructor(private httpUserService: HttpUserService,
              public dialogRef: MatDialogRef<DialogComponent>,
              private sessionService: SessionService,
              private gameIo: GameIoService) {

  }

  ngOnInit(): void {
  }

  private userLogin(): any {
    this.httpUserService.userLogin(this.userId, this.userPassword).subscribe( result => {

      this.session = result['success'];
      this.sessId = result['session'];

      if (this.session === true) {
        alert('로그인 성공');
        this.user.sessionId = this.sessId;
        this.user.currentPage = 'waiting';
        this.sessionService.setSessionId(this.user.sessionId);
        this.sessionService.setCurrentPage(this.user.currentPage);

        this.gameIo.setRoomId('0');

        this.dialogRef.close();
      } else {
        alert('회원 정보가 일치하지 않습니다');
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyUp() {
    if (this.userId && this.userPassword) {
      if (this.userId.length > 0 && this.userPassword.length > 0)
        this.validation = false;
      else
        this.validation = true;
    } else {
      this.validation = true;
    }
  }
}
