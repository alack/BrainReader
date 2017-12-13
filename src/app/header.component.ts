/**
 * Created by jaehong on 2017. 12. 6..
 */
import { Component, OnInit } from '@angular/core';
import { SessionService } from './service/session.service';
import { GameIoService } from './service/game-io.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-header',
    template: `
        <mat-toolbar color="primary">
            <button mat-button>
                Brain Reader
            </button>
            <span style="flex: 1 1 auto;"></span>
            <div [ngSwitch]="sessionService.currentPage">
                <button mat-button (click)="onLogout()" *ngSwitchCase="'waiting'">Logout</button>
                <button mat-button (click)="onExit()" *ngSwitchCase="'game'">Exit</button>
            </div>
        </mat-toolbar>
        `
})

export class Header implements OnInit {
    constructor(private sessionService: SessionService,
                private gameio: GameIoService,
                private http: HttpClient) { }

    ngOnInit(): void { }

    onLogout() {
        this.http.post('/user/logout', {}).subscribe(data => {
            if (data['result']) {
                this.sessionService.setSessionId(null);
                this.sessionService.setCurrentPage('login');
                this.gameio.leaveRoom();
            }
        });
    }

    onExit() {
        this.sessionService.setCurrentPage('waiting');
    }
}
