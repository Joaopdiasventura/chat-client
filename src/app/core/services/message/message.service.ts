import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../../models/message';
import { CreateMessageDto } from '../../../shared/dto/message/create-message.dto';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly apiUrl = API_URL + '/message';
  private http = inject(HttpClient);

  public create(createMessageDto: CreateMessageDto): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, createMessageDto, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }

  public findLastest(user: string): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl + `/findLastest/${user}`, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }

  public findManyByChat(user: string): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl + `/findManyByChat/${user}`, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }
}
