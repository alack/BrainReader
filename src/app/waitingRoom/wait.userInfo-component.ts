import {Component, OnInit } from '@angular/core';
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
    this.user = {
      id: 'hibria',
      correct: 251,
      attempt: 512,
      points: 1442,
      image: 'sssss.jpg'
    }

    this.http.get('/user/me').subscribe( user => {
      this.user = user;
      console.log(this.user);
    });
  }
}
