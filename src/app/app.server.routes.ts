import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'access', renderMode: RenderMode.Prerender },
  { path: 'access/validate', renderMode: RenderMode.Prerender },
];
