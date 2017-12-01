import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WaitLobbyComponent, CreateRoom } from './waitingRoom/wait.lobby-component';
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
import { WaitRoomComponent, InputPassword } from './waitingRoom/wait.room-component';

// material
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCheckboxModule, MatDialogModule, MatInputModule, MatSelectModule, MatIconModule } from '@angular/material';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
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
    InputPassword
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
    MatSelectModule,
    MatCardModule,
    MatListModule,
    MatIconModule
  ],
  providers: [HttpWaitingRoomService],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateRoom,
    InputPassword
  ]
})
export class AppModule { }
