import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home-page/home-page.component';
import { AccessPageComponent } from './features/user/access/access-page/access-page.component';
import { ValidatePageComponent } from './features/user/access/validate-page/validate-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'access', component: AccessPageComponent },
  { path: 'access/validate', component: ValidatePageComponent },
];
