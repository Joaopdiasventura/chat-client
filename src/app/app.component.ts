import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';
import { LoadingPageComponent } from './shared/components/loading/loading-page/loading-page.component';

@Component({
  selector: 'app-root',
  imports: [LoadingPageComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public isLoading: boolean = false;

  private authService = inject(AuthService);

  public ngOnInit(): void {
    this.authService.loading$.subscribe((loading: boolean) =>
      setTimeout(() => (this.isLoading = loading), 0)
    );
  }
}
