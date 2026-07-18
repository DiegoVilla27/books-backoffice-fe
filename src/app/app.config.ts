import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ROUTES } from './app.routes';
import { authInterceptor } from '@core/interceptors/jwt.interceptor';

/**
 * Global application configuration settings.
 * Declares providers for ZoneJS change detection optimization, core routing definitions,
 * interceptor-enabled HTTP client services, and customized, style-matching dark mode toast configurations.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(ROUTES),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};

