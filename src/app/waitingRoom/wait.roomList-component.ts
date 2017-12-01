import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector : 'app-wait-room-list',
  templateUrl: './wait.roomList-component.html',
  styleUrls: ['./wait.roomList-component.css']
})

export class WaitRoomListComponent implements OnInit {
  rooms: Object[];
  selectedRooms: Object[];
  input;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Make the HTTP request:
    // this.http.get('/room').subscribe(data => {
    //   // Read the result field from the JSON response.
    //   this.rooms = data['result'];
    // });

    this.rooms = [
     {
      name: 'asdf',
    password: '1234',
    type: 'all',
    maxUser: 8,
    userCount: 1,
     },
    {
      name: 'ho',
      password: '',
      type: 'all',
      max: 8,
      user: 1,
    },
    {
      name: 'hi2',
      password: '2222',
      type: 'all',
      max: 8,
      user: 1,
    }
    ];
    this.selectedRooms = this.rooms;
  }
  getRoomList() {
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.selectedRooms = this.rooms = data['result'];
    });
  }
  onKeyDown() {
    console.log(this.selectedRooms);
    this.selectedRooms = this.rooms.filter((room) => {
      return (room['name'].includes(this.input)) ? true:false;
    })
  }
}
