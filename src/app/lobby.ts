import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'lobby',
  template: ' <li *ngFor="let room of rooms">' +
  '{{room.room}}</li> '
})
export class Lobby implements OnInit {
  title = 'app';
  rooms: Object[];
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Make the HTTP request:
    this.http.get('/room').subscribe(data => {
      // Read the result field from the JSON response.
      this.rooms = data['result'];

      console.log(this.rooms);
    });
  }

}
