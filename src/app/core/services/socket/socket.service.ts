import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';

declare const API_URL: string;
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  public connect(query: {
    email?: string;
    call?: string;
    name?: string;
    color?: string;
  }): Socket {
    return io(API_URL, {
      query,
    });
  }
}
