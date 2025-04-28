import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, map, catchError } from 'rxjs';
import { User } from '../../models/user';
import { UserService } from '../user/user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private router = inject(Router);

  private userDataSource = new BehaviorSubject<User | null>(null);

  private loadingSubject = new BehaviorSubject<boolean>(false);

  public get loading$() {
    return this.loadingSubject.asObservable();
  }

  public setLoading$(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  public connectUser(user?: User | null): Observable<User | null> {
    if (user) this.updateUserData(user);

    if (this.currentUserData) {
      this.setFavicon(this.currentUserData.color);
      return of(this.currentUserData);
    }

    if (isPlatformServer(this.platformId)) return of(null);

    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['access']);
      return of(null);
    }

    this.loadingSubject.next(true);

    return this.userService.decodeToken(token).pipe(
      map((result) => {
        this.updateUserData(result);
        this.setFavicon(result.color);
        this.loadingSubject.next(false);
        return result;
      }),
      catchError(() => {
        this.router.navigate(['access']);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }

  public disconnectUser() {
    if (isPlatformServer(this.platformId)) return;
    localStorage.removeItem('token');
    this.updateUserData(null);
  }

  public updateUserData(data: User | null) {
    this.userDataSource.next(data);
  }

  private get currentUserData() {
    return this.userDataSource.value;
  }

  private setFavicon(color: string) {
    let link = document.getElementById('app-icon') as HTMLLinkElement;
    link.setAttribute('type', 'image/svg+xml');
    link.setAttribute('href', `svg/${color}-icon.svg`);
  }
}
