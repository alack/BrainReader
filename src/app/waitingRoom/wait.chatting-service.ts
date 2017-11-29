/**
 * Created by jaehong on 2017. 11. 29..
 */
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class ChatService {
    private url = 'http://localhost:3000';
    private socket;

    joinRoom() {
        this.socket = io(this.url);
        let data = {name:''};
        this.socket.emit('joinroom', data);
    }
    sendMessage(message){
        let data = {
            roomId: '',
            message: message
        }
        this.socket.emit('send:message', data);
    }

    getMessages() {
        let observable = new Observable(observer => {

            this.socket.on('send:message', (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.leave();
                this.socket.disconnect();
            };
        })
        return observable;
    }
}