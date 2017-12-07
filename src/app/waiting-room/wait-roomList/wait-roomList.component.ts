import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector : 'app-wait-room-list',
  templateUrl: './wait-roomList.component.html',
  styleUrls: ['./wait-roomList.component.css']
})

export class WaitRoomListComponent implements OnInit {
  rooms: Object[];
  selectedRooms: Object[];
  input;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getRoomList();
  }
  getRoomList() {
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.rooms = data['result'];
      this.selectedRooms = this.rooms;
    });
  }
  onKeyDown() {
    this.selectedRooms = this.rooms.filter((room) => {
      return !!(room['name'].includes(this.input));
    });
  }
}
