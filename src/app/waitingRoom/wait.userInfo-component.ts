import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({

  selector: 'app-wait-user-info',
  templateUrl: './wait.userInfo-component.html',
  styleUrls: ['./wait.userInfo-component.css']
})

export class WaitUserInfoComponent implements OnInit {
  user;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // this.http.get('/user/me', user => {
    //   this.user = user;
    // })

    this.user = {
      id: 'hibria',
      correct: 251,
      attempt: 512,
      points: 1442
    }
  }

}
