import {Component, OnInit, OnDestroy} from '@angular/core';
import { GameIoService } from '../../service/game-io.service';

@Component({
  selector : 'app-wait-user-list',
  templateUrl: './wait-userList.component.html',
  styleUrls: ['./wait-userList.component.css']
})

export class WaitUserListComponent implements  OnInit, OnDestroy {
  users = [];
  connection;
  constructor(private gameIo: GameIoService) {

  }

  ngOnInit(): void {
    // 서버에서 가져오는 걸로 수정하기
    this.users.push('test');
    this.connection = this.gameIo.getUserList().subscribe(result => {
      this.users = result['users'];
    });
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
