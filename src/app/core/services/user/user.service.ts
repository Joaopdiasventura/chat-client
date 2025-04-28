import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateUserDto } from '../../../shared/dto/user/create-user.dto';
import { Observable } from 'rxjs';
import { AuthResponseMessage } from '../../../shared/interfaces/auth-response-message';
import { LoginUserDto } from '../../../shared/dto/user/login-user.dto';
import { User } from '../../models/user';
import { UpdateUserDto } from '../../../shared/dto/user/update-user.dto';
import { ResponseMessage } from '../../../shared/interfaces/reponse-message';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = API_URL + '/user';
  private http = inject(HttpClient);

  public create(createUserDto: CreateUserDto): Observable<AuthResponseMessage> {
    return this.http.post<AuthResponseMessage>(this.apiUrl, createUserDto);
  }

  public login(loginUserDto: LoginUserDto): Observable<AuthResponseMessage> {
    return this.http.post<AuthResponseMessage>(
      this.apiUrl + '/login',
      loginUserDto
    );
  }

  public decodeToken(token: string): Observable<User> {
    return this.http.get<User>(this.apiUrl + `/decodeToken/${token}`);
  }

  public update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Observable<ResponseMessage> {
    return this.http.patch<ResponseMessage>(
      this.apiUrl + `/${id}`,
      updateUserDto,
      {
        headers: { Authorization: localStorage.getItem('token') as string },
      }
    );
  }

  public validateEmail(token: string) {
    return this.http.patch(this.apiUrl + '/validateEmail/' + token, {});
  }
}
