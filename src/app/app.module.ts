import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import {
  MatCardModule,
  MatGridListModule,
  MatButtonModule,
  MatCheckboxModule,
  MatProgressBarModule
} from '@angular/material';

import { AppComponent } from './app.component';

import { WaitUserListComponent } from './waitingRoom/wait.userList-component';
import { WaitChattingComponent } from './waitingRoom/wait.chatting-component';
import { WaitRoomListComponent } from './waitingRoom/wait.roomList-component';
import { WaitUserInfoComponent } from './waitingRoom/wait.userInfo-component';
import { HttpWaitingRoomService } from './service/http.waitingRoom.service';

import { GameRoomComponent } from './game-room/game-room.component';
import { GameChatComponent } from './game-room/game-chat/game-chat.component';
import { GameCanvasComponent } from './game-room/game-canvas/game-canvas.component';
import { GameUserRightComponent } from './game-room/game-user-right/game-user-right.component';
import { GameUserLeftComponent } from './game-room/game-user-left/game-user-left.component';
import { GameComponent } from './game-room/game/game.component';
import { GameIoService } from './game-room/game-io.service';

import { HttpClientModule} from '@angular/common/http';
import { FormsModule} from '@angular/forms';





@NgModule({
  declarations: [
    AppComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent,
    WaitUserInfoComponent,
    GameRoomComponent,
    GameChatComponent,
    GameCanvasComponent,
    GameUserRightComponent,
    GameUserLeftComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatGridListModule,
    MatCardModule,
    MatProgressBarModule
  ],
  providers: [
    HttpWaitingRoomService,
    GameIoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
