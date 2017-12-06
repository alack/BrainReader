import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { OverlayModule } from '@angular/cdk/overlay';
import {
  MatCardModule,
  MatGridListModule,
  MatButtonModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatDialogModule,
  MatInputModule,
  MatSelectModule,
  MatIconModule,
  MatTabsModule,
  MatFormFieldModule,
  MatListModule,
  MatButtonToggleModule
} from '@angular/material';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

import { ChatComponent } from './common/common-chat.component';

import {HttpWaitingRoomService} from './service/http.waitingRoom.service';
import { WaitLobbyComponent, CreateRoom, Rank } from './waitingRoom/wait.lobby-component';
import {WaitUserListComponent} from './waitingRoom/wait.userList-component';
import {WaitChattingComponent} from './waitingRoom/wait.chatting-component';
import {WaitRoomListComponent} from './waitingRoom/wait.roomList-component';
import {WaitUserInfoComponent} from './waitingRoom/wait.userInfo-component';
import { WaitRoomComponent, InputPassword } from './waitingRoom/wait.room-component';

import { GameRoomComponent } from './game-room/game-room.component';
import { GameCanvasComponent } from './game-room/game-canvas/game-canvas.component';
import { GameUserRightComponent } from './game-room/game-user-right/game-user-right.component';
import { GameUserLeftComponent } from './game-room/game-user-left/game-user-left.component';
import { GameComponent } from './game-room/game/game.component';
import { GameIoService } from './service/game-io.service';

import {DialogComponent, StartComponent} from './loginRoom/startComponent';
import {TabsOverviewComponent} from './loginRoom/tabs-overview';
import {RegisterComponent} from './loginRoom/registerComponent';
import {LoginComponent} from './loginRoom/loginComponent';

import {HttpUserService} from './service/http.user.service';

import {SessionService} from './service/session.service';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,

    WaitLobbyComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent,
    WaitUserInfoComponent,

    GameRoomComponent,
    GameCanvasComponent,
    GameUserRightComponent,
    GameUserLeftComponent,
    GameComponent,

    CreateRoom,
    Rank,
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
    MatTabsModule,
    MatProgressBarModule,
    MatButtonToggleModule
  ],
  providers: [
    HttpWaitingRoomService,
    HttpUserService,
    SessionService,
    GameIoService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateRoom,
    InputPassword,
    DialogComponent,
    Rank
  ]
})
export class AppModule { }
