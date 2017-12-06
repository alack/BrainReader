
import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class SessionService {

  sessionId: string;

  image: string;
  attempt: number;
  correct: number;
  points: number;
  public currentPage='login';

  constructor(private http: HttpClient) {

  }

  setSessionId(sid) {
    this.sessionId = sid;
  }

  getSessionId() {
    return this.sessionId;
  }

  setCurrentPage(s) {
    this.currentPage = s;
  }
  getCurrentPage() {
   return this.currentPage;
  }

  setImage(imgUrl) {
    console.log('프로필 이미지 업데이트');
    return this.http.put('/user/' + this.getSessionId(), {image: imgUrl}).subscribe(result =>
      console.log(result));
  }

  getImage() {
    return this.image;
  }

  setAttempt() {
    this.attempt += 1;
  }
  getAttempt() {
    return this.attempt;
  }

  setCorrect() {
    this.correct += 1;
  }

  getCorrect() {
    return this.correct;
  }

  setPoints(point) {
    this.points += point;
  }

  getPoints() {
    return this.points;
  }
}
