/**
 * Created by jaehong on 2017. 12. 6..
 */
import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
    <footer>
        <mat-toolbar color="primary" style="height: 50%">
            <mat-toolbar-row style="height: 50%">
                <span style="flex: 1"></span>
                    Brain Reader @ Ajou University
                <span style="flex: 1"></span>
            </mat-toolbar-row>
            <mat-toolbar-row style="height: 50%">
                <span style="flex: 1"></span>
                    <a href="https://github.com/alack/BrainReader/" style="text-decoration: none; color: #ffffff; font-size: 15px;">
                    Github
                    </a>
                <span style="flex: 1"></span>
            </mat-toolbar-row>
        </mat-toolbar>
        
    </footer>
        `
})

export class Footer {

}