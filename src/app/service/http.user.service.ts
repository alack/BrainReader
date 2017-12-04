

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

@Injectable()
export class HttpUserService {

  constructor(private http: HttpClient) {

  }
  // 로그인
  userLogin(userId, userPw) {
    return this.http.post('/user/login', {id: userId, password: userPw });
  }

  // 회원가입
  userRegister(userId, userPw) {
    console.log('userRegister service');
    return this.http.post( '/user/', {id: userId, password: userPw});
  }
}
