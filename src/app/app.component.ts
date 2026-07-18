// src/app/app.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CacheDevToolsComponent } from '@shared/components/cache-devtools/cache-devtools.component';

/**
 * Root component of the Angular application.
 * Defines the main root router outlet for page layout injections.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CacheDevToolsComponent],
  template: `
    <router-outlet></router-outlet>
    
    <!-- Panel flotante de monitoreo -->
    <app-cache-devtools />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent { }