import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat } from '../../models/chat';
import { CreateChatDto } from '../../../shared/dto/chat/create-chat.dto';
import { ResponseMessage } from '../../../shared/interfaces/reponse-message';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = API_URL + '/chat';
  private http = inject(HttpClient);

  public create(createChatDto: CreateChatDto): Observable<ResponseMessage> {
    return this.http.post<ResponseMessage>(this.apiUrl, createChatDto, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }

  public findByUser(user: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(this.apiUrl + `/${user}`, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }
}
