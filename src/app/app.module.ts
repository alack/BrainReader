import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WaitRoomComponent, CreateRoom } from './waitingRoom/wait.room-component';
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

// material
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatDialogModule, MatInputModule, MatSelectModule} from '@angular/material';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    WaitRoomComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent,
    WaitUserInfoComponent,
    GameUserListComponent,
    GameChattingComponent,
    GameCanvasComponent,
    CreateRoom
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  providers: [HttpWaitingRoomService],
  bootstrap: [AppComponent],
  entryComponents: [CreateRoom]
})
export class AppModule { }
