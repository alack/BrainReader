import { Component, OnInit } from '@angular/core';
import { SessionService } from './service/session.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})


export class AppComponent implements OnInit {
  sessionId: string;
  currentPage;

  constructor(private sessionService: SessionService,
              private http: HttpClient) {
   this.sessionId = sessionService.getSessionId();
   this.currentPage = sessionService.getCurrentPage();
  }

 ngOnInit(): void {
    this.http.get('/user/check').subscribe(result => {
      console.log('app-component result : ', result, '  ', this.sessionService.getCurrentPage());
     if ( result['result'] == 'failed' )
         console.log('세션 없음');
     else {
         this.sessionService.setCurrentPage('waiting');
         // console.log(result['id']);
         this.sessionService.setSessionId(result['id']);
     }
    });
  }

}
