import { Component, OnInit } from '@angular/core';
import { SessionService } from './service/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})


export class AppComponent implements OnInit {
  sessionId: string;
  currentPage;

  constructor(private sessionService: SessionService) {
   this.sessionId = sessionService.getSessionId();
   this.currentPage = sessionService.getCurrentPage();
  }

 ngOnInit(): void {

 }

}
