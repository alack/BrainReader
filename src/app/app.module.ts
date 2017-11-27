import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {WaitUserListComponent} from './waitingRoom/wait.userList-component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {HttpWaitingRoomService} from './service/http.waitingRoom.service';
import {WaitChattingComponent} from './waitingRoom/wait.chatting-component';
import {WaitRoomListComponent} from './waitingRoom/wait.roomList-component';



@NgModule({
  declarations: [
    AppComponent,
    WaitUserListComponent,
    WaitChattingComponent,
    WaitRoomListComponent
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
