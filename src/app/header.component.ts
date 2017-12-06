/**
 * Created by jaehong on 2017. 12. 6..
 */
import { Component, OnInit } from '@angular/core';
import { SessionService } from "./service/session.service";
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
                private http: HttpClient) { }

    ngOnInit(): void { }

    onClick() {
        if(this.sessionService.getSessionId())
            this.sessionService.setCurrentPage('waiting');
    }

    onLogout() {
        this.http.post('/user/logout',{}).subscribe(data => {
            if(data['result']) {
                this.sessionService.setSessionId(null);
                this.sessionService.setCurrentPage('login');
            }
        });
    }

}
