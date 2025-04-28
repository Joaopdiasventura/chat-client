import { Component } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'loading-page',
  imports: [LoadingComponent],
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.scss',
})
export class LoadingPageComponent {}
