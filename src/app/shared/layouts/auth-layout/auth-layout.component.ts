import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Controller component for the authentication layout wrapper.
 * Renders sign-in/registration child routes inside a custom dark mode gradient background wrapper.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Contenedor de pantalla completa dedicado a Auth con su gradiente exclusivo -->
    <div class="relative min-h-screen w-screen overflow-y-auto bg-zinc-950 text-zinc-100 flex items-center justify-center selection:bg-purple-500/30 selection:text-purple-200">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-zinc-950/50 to-zinc-950 pointer-events-none"></div>
      
      <div class="relative w-full py-12 z-10">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent { }