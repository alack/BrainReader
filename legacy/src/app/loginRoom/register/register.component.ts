
import {Component, OnInit} from '@angular/core';
import {HttpUserService} from '../../service/http-user.service';
import {DialogComponent} from '../start/start.component';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerId: string;
  registerPw: string;
  validation = true;  // true 이면 로그인 버튼 비활성화

  constructor(private httpUserService: HttpUserService, public dialogRef: MatDialogRef<DialogComponent>) {
  }

  ngOnInit(): void {
  }

  private userRegister(): any {
    this.httpUserService.userRegister(this.registerId, this.registerPw).subscribe(result => {
      console.log(result);

      if ( result['result'] === 1) {
        alert('회원가입이 성공적으로 완료되었습니다');
      }else {
        alert('이미 존재하는 아이디입니다');
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyUp() {
    if (this.registerId && this.registerPw) {
      if (this.registerId.length > 0 && this.registerPw.length > 0)
        this.validation = false;
      else
        this.validation = true;
    } else {
      this.validation = true;
    }
  }
}
