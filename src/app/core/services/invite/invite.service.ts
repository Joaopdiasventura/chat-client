import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResponseMessage } from '../../../shared/interfaces/reponse-message';
import { Observable } from 'rxjs';
import { Chat } from '../../models/chat';
import { Invite } from '../../models/invite';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class InviteService {
  private readonly apiUrl = API_URL + '/invite';
  private http = inject(HttpClient);

  public accept(id: string): Observable<Chat> {
    return this.http.post<Chat>(
      this.apiUrl + `/${id}`,
      {},
      {
        headers: { Authorization: localStorage.getItem('token') as string },
      }
    );
  }

  public findByUser(user: string): Observable<Invite[]> {
    return this.http.get<Invite[]>(this.apiUrl + `/${user}`, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }

  public delete(id: string): Observable<ResponseMessage> {
    return this.http.delete<ResponseMessage>(this.apiUrl + `/${id}`, {
      headers: { Authorization: localStorage.getItem('token') as string },
    });
  }
}
