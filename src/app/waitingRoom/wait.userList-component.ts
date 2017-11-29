import {Component, OnInit} from '@angular/core';

@Component({
  selector : 'app-wait-user-list',
  templateUrl: './wait.userList-component.html',
  styleUrls: ['./wait.userList-component.css']

})

export class WaitUserListComponent implements  OnInit {
  users = [];

  constructor() {

  }

  ngOnInit(): void {
    // 서버에서 가져오는 걸로 수정하기
    for(let a = 1;a<50;a++)
      this.users.push('a'+ a);
  }
}
