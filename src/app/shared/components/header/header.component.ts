import { UserService } from './../../../core/services/user/user.service';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../core/models/user';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public currentUser: User | null = null;
  public showColorPicker = false;

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  public ngOnInit(): void {
    this.authService
      .connectUser()
      .subscribe((user) => (this.currentUser = user));
  }

  public toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
  }

  public changeColor(color: string): void {
    this.authService.setLoading$(true);
    this.userService.update(this.currentUser!._id, { color }).subscribe(() => {
      this.currentUser!.color = color;
      this.authService.connectUser(this.currentUser);
      this.router.navigate([], { queryParamsHandling: 'preserve' });
      this.showColorPicker = false;
      this.authService.setLoading$(false);
    });
  }

  public diconnect(): void {
    this.authService.disconnectUser();
    this.router.navigate(['access']);
  }
}
