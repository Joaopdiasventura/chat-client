import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user/user.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading/loading.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-validate-page',
  imports: [LoadingComponent, ButtonComponent],
  templateUrl: './validate-page.component.html',
  styleUrl: './validate-page.component.scss',
})
export class ValidatePageComponent implements OnInit {
  public isLoading: boolean = false;

  private token: string = '';

  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') as string;
  }

  public validate() {
    this.isLoading = true;
    this.userService.validateEmail(this.token).subscribe({
      next: () => window.close(),
      error: () => this.router.navigate(['access']),
    });
  }
}
