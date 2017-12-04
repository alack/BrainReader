
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HttpUserService} from '../service/http.user.service';
import {DialogComponent} from './startComponent';
import {MatDialogRef} from '@angular/material';
import {SessionService} from '../service/session.service';

@Component({
  selector: 'app-login',
  templateUrl: './loginComponent.html',
  styleUrls: ['./loginComponent.css']
})
export class LoginComponent implements OnInit {
  sendUser: EventEmitter<void> = new EventEmitter<void>();

  userId: string;
  userPassword: string;
  session: boolean;
  sessId: string;

  user = {
    sessionId: '',
    currentPage: ''
  };

  constructor(private httpUserService: HttpUserService,
              public dialogRef: MatDialogRef<DialogComponent>,
              private sessionService: SessionService) {

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

        this.dialogRef.close();
      } else {
        alert('회원 정보가 일치하지 않습니다');
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
