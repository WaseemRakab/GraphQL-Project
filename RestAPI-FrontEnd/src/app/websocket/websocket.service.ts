import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import * as socketIO from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private readonly socket: SocketIOClient.Socket;

  constructor() {
    this.socket = socketIO(environment.wsUrl);
  }

  get io() {
    return this.socket;
  }
}
