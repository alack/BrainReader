import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {WaitUserListComponent} from './waitingRoom/wait.userList-component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {HttpWaitingRoomService} from './service/http.waitingRoom.service';
import {WaitChattingComponent} from './waitingRoom/wait.chatting-component';
import {WaitRoomListComponent} from './waitingRoom/wait.roomList-component';
import {WaitUserInfoComponent} from './waitingRoom/wait.userInfo-component';
import {GameUserListComponent} from './gameRoom/game.userList-component';
import {GameChattingComponent} from './gameRoom/game.chatting-component';
import {GameCanvasComponent} from './gameRoom/game.canvas-component';



@NgModule({
  declarations: [
    AppComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent,
    WaitUserInfoComponent,
    GameUserListComponent,
    GameChattingComponent,
    GameCanvasComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [HttpWaitingRoomService],
  bootstrap: [AppComponent]
})
export class AppModule { }
