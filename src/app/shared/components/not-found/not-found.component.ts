import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';

/**
 * Presentation and navigation fallback component for handling unmatched route states (404).
 * Serves as a user-friendly destination when a user targets a non-existent URL layout,
 * a deleted asset, or gets caught by wildcards due to insufficient role capabilities.
 * 
 * @remarks
 * This view component utilizes {@link ChangeDetectionStrategy.OnPush} to maintain zero overhead 
 * during application state evaluation cycles, rendering context exclusively through static layout frames.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 selection:bg-purple-500 selection:text-white">
      <div class="max-w-md w-full text-center space-y-8 animate-fade-in">
        <!-- Ilustración / Elemento Visual -->
        <div class="relative flex justify-center">
          <span class="text-[120px] font-black tracking-widest text-zinc-900 select-none">404</span>
          <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
            Página No Encontrada
          </span>
        </div>
        <!-- Mensaje descriptivo -->
        <div class="space-y-3">
          <h2 class="text-xl font-semibold text-zinc-300">¿Te has perdido?</h2>
          <p class="text-zinc-500 text-sm leading-relaxed">
            La ruta a la que estás intentando acceder no existe, ha sido movida o la sesión no cuenta con los permisos necesarios.
          </p>
        </div>
        <!-- Botones de Acción -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            [routerLink]="dashboardRoute"
            class="px-6 py-2.5 w-full sm:w-auto text-sm font-semibold rounded-lg bg-purple-500 text-white hover:bg-purple-400 active:scale-95 transition-all shadow-lg shadow-purple-500/10"
          >
            Ir al Dashboard
          </a>
          <button
            (click)="goBack()"
            class="px-6 py-2.5 w-full sm:w-auto text-sm font-semibold rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-900 active:scale-95 transition-all"
          >
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {
  /** Injected Angular Router utility managing navigation states. */
  private readonly router = inject(Router);

  /** 
   * Absolute URL pointing toward the primary administrative landing control panel.
   * Feeds the template router link bound directly from central core path maps.
   */
  readonly dashboardRoute = ROUTES_MAPPING.admin.dashboard;

  /**
   * Intercepts user pointer interaction to trigger reverse session travel.
   * Instructs the global window platform layer to step backward one index position 
   * in the native web architecture history stack.
   */
  goBack(): void {
    window.history.back();
  }
}