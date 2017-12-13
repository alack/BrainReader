import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
  MatButtonToggleModule,
  MatToolbarModule,
  MatRadioModule
} from '@angular/material';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { Header } from './header.component';
import { Footer } from './footer.component';

import { ChatComponent } from './common/common-chat.component';


import {WaitLobbyComponent, Rank, CreateRoom} from './waiting-room/waiting-room.component';
import { WaitUserListComponent } from './waiting-room/wait-userList/wait-userList.component';
import { WaitRoomListComponent } from './waiting-room/wait-roomList/wait-roomList.component';
import { WaitUserInfoComponent } from './waiting-room/wait-userInfo/wait-userInfo.component';
import { WaitRoomComponent, InputPassword } from './waiting-room/wait-roomList/wait-room/room.component';

import { GameRoomComponent } from './game-room/game-room.component';
import { GameCanvasComponent } from './game-room/game-canvas/game-canvas.component';
import { GameUserRightComponent } from './game-room/game-user-right/game-user-right.component';
import { GameUserLeftComponent } from './game-room/game-user-left/game-user-left.component';
import { GameComponent } from './game-room/game/game.component';


import { DialogComponent, StartComponent } from './loginRoom/start/start.component';
import { TabsOverviewComponent } from './loginRoom/start/tabs-overview.component';
import { RegisterComponent } from './loginRoom/register/register.component';
import { LoginComponent } from './loginRoom/login/login.component';

import { HttpUserService } from './service/http-user.service';
import { GameIoService } from './service/game-io.service';
import { SessionService } from './service/session.service';
import { UserImageComponent } from './waiting-room/wait-userInfo/userImage/user-Image.component';
import { ColorsComponent } from './game-room/game-canvas/colors/colors.component';
import { UpdateRoomComponent, UpdateRoomModalComponent } from "./game-room/game/update-room/update-room.component";
@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    Header,
    Footer,

    WaitLobbyComponent,
    WaitUserListComponent,
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
    UserImageComponent,
    ColorsComponent,
    UpdateRoomComponent,
    UpdateRoomModalComponent
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
    MatButtonToggleModule,
    MatToolbarModule,
    MatRadioModule
  ],
  providers: [
    HttpUserService,
    SessionService,
    GameIoService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CreateRoom,
    InputPassword,
    DialogComponent,
    Rank,
    UpdateRoomModalComponent
  ]
})
export class AppModule { }
