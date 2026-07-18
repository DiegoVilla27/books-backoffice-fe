import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Boots the Angular client application by bootstrapping the root component
 * with the defined global configurations.
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

