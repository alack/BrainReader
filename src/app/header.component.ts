/**
 * Created by jaehong on 2017. 12. 6..
 */
import { Component, OnInit } from '@angular/core';
import { SessionService } from "./service/session.service";
import { GameIoService } from './service/game-io.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-header',
    template: `
        <mat-toolbar color="primary">
            <button mat-button (click)="onClick()">
                Brain Reader
            </button>
            <span style="flex: 1 1 auto;"></span>
            <button *ngIf="sessionService.getSessionId()" mat-button (click)="onLogout()">
                Logout
            </button>
        </mat-toolbar>
        `
})

export class Header implements OnInit {
    constructor(private sessionService: SessionService,
                private gameio: GameIoService,
                private http: HttpClient) { }

    ngOnInit(): void { }

    onClick() {
        if(this.sessionService.getSessionId()) {
            this.sessionService.setCurrentPage('waiting');
            this.gameio.setRoomId(0);
        }
    }

    onLogout() {
        this.http.post('/user/logout',{}).subscribe(data => {
            if(data['result']) {
                this.sessionService.setSessionId(null);
                this.sessionService.setCurrentPage('login');
                this.gameio.setRoomId(-1);
                this.gameio.joinRoom();
                this.gameio.requestUserList();
            }
        });
    }

}
