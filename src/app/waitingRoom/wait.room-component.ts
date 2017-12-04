/**
 * Created by jaehong on 2017. 11. 29..
 */
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogClose } from '@angular/material/dialog';
import { Room } from '../../../models/room';

@Component({
    selector : 'app-wait-room',
    template: `
    <mat-card (click)="enterPassword()">
        <mat-card-header style="height: 70px;">
            {{room.name}}
        </mat-card-header>
        <mat-card-content>
            <img mat-card-image src="https://material.angular.io/assets/img/examples/shiba2.jpg" alt="Photo of a Shiba Inu">
            <p align="right">{{room.userCount}}/{{room.maxUser}}</p>
        </mat-card-content>
    </mat-card>`
})

export class WaitRoomComponent implements OnInit {
    @Input() room: Room;

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {
    }

    enterPassword(): void {
        (this.room.password == '' ? this.correctPassword():this.openDialog());
    }

    openDialog(): void {
        let dialogRef = this.dialog.open(InputPassword, {
            width: '250px'
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('result', result);
            (result == this.room.password? this.correctPassword():alert('nono'));
        });

        // dialogRef.keydownEvents().subscribe(result => {
        //     console.log(dialogRef.password,'how to ok when enter key input');
        //     if(result.key == 'Enter') {
        //         dialogRef.close(dialogRef.password);
        //     }
        // })
    }

    correctPassword(): void {
        alert('gogo');
    }
}

@Component({
    selector: 'input-password',
    template: `
    <h1 mat-dialog-title>Enter a Password</h1>
    <div mat-dialog-content>
        <mat-form-field>
            <input matInput [(ngModel)]="password">
        </mat-form-field>
    </div>
    <div mat-dialog-actions>
        <button mat-button [mat-dialog-close]="password" tabindex="2">Enter</button>
        <button mat-button (click)="onNoClick()" tabindex="-1">Cancel</button>
    </div>
    `
})
export class InputPassword {
    password: string;

    constructor(public dialogRef: MatDialogRef<InputPassword>) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}



