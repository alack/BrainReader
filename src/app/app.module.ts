import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { WaitLobbyComponent, CreateRoom } from './waitingRoom/wait.lobby-component';

import {WaitUserListComponent} from './waitingRoom/wait.userList-component';

import {HttpWaitingRoomService} from './service/http.waitingRoom.service';
import {WaitChattingComponent} from './waitingRoom/wait.chatting-component';
import {WaitRoomListComponent} from './waitingRoom/wait.roomList-component';
import {WaitUserInfoComponent} from './waitingRoom/wait.userInfo-component';
import {GameUserListComponent} from './gameRoom/game.userList-component';
import {GameChattingComponent} from './gameRoom/game.chatting-component';
import {GameCanvasComponent} from './gameRoom/game.canvas-component';
import { WaitRoomComponent, InputPassword } from './waitingRoom/wait.room-component';
import {HttpUserService} from './service/http.user.service';
import {DialogComponent, StartComponent} from './loginRoom/startComponent';
import {TabsOverviewComponent} from './loginRoom/tabs-overview';
import {RegisterComponent} from './loginRoom/registerComponent';
import {LoginComponent} from './loginRoom/loginComponent';
import {SessionService} from './service/session.service';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatDialogModule, MatInputModule, MatSelectModule, MatIconModule, MatTabsModule } from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';

@NgModule({
  declarations: [
    AppComponent,
    WaitLobbyComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent,
    WaitUserInfoComponent,
    GameUserListComponent,
    GameChattingComponent,
    GameCanvasComponent,

    CreateRoom,
    WaitRoomComponent,
    InputPassword,

    StartComponent,
    DialogComponent,
    TabsOverviewComponent,
    RegisterComponent,
    LoginComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatTabsModule
  ],
  providers: [HttpWaitingRoomService, HttpUserService, SessionService],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateRoom,
    InputPassword,
    DialogComponent
  ]
})
export class AppModule { }
