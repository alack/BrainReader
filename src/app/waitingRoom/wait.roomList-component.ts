import {Component, Input, OnInit} from '@angular/core';



@Component({
  selector : 'app-wait-room-list',
  templateUrl: './wait.roomList-component.html',
  styleUrls: ['./wait.roomList-component.css']
})

export class WaitRoomListComponent implements OnInit {
  @Input() session;
  constructor() {

  }

  ngOnInit(): void {
  }
}
