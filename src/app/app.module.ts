import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import {AppComponent} from './app.component';
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
import {HttpUserService} from './service/http.user.service';
import {DialogComponent, StartComponent} from './loginRoom/startComponent';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatDialogModule, MatInputModule} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material';
import {TabsOverviewComponent} from './loginRoom/tabs-overview';
import {RegisterComponent} from './loginRoom/registerComponent';
import {LoginComponent} from './loginRoom/loginComponent';
import {SessionService} from './service/session.service';

@NgModule({
  declarations: [
    AppComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent,
    WaitUserInfoComponent,
    GameUserListComponent,
    GameChattingComponent,
    GameCanvasComponent,
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
    MatDialogModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule
  ],
  providers: [HttpWaitingRoomService, HttpUserService, SessionService],
  bootstrap: [AppComponent],
  entryComponents: [DialogComponent]
})
export class AppModule { }
