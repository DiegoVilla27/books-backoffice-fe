import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { AsideComponent } from '@shared/components/aside/aside.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { BreadcrumbsComponent } from '@shared/components/ui/breadcrumbs/breadcrumbs.component';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CacheDevToolsComponent } from '@shared/components/cache-devtools/cache-devtools.component';

/**
 * Core structural layout wrapper for the protected administrative application domain.
 * Orchestrates the application shell by assembling global scaffolding modules—including 
 * the persistent header navigation, contextual aside drawer, reactive breadcrumb navigation paths, 
 * independent layout scroll wrappers, and debugging monitoring diagnostics panels.
 * 
 * @remarks
 * This layout boundary utilizes {@link ChangeDetectionStrategy.OnPush} to bypass routine 
 * change-detection cycles, relying exclusively on reactive Signals state mutations and 
 * strict input reference deltas to optimize presentation layer metrics.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    AsideComponent,
    FooterComponent,
    BreadcrumbsComponent,
    CacheDevToolsComponent
  ],
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-purple-500/30 selection:text-purple-200">
      
      <!-- Header Fijo Superior -->
      <app-header class="shrink-0"></app-header>
      
      <!-- Contenedor del espacio de trabajo -->
      <div class="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        
        <!-- Sidebar Fijo -->
        <app-aside class="shrink-0 h-full border-r border-zinc-900 bg-zinc-950/50"></app-aside>
        
        <!-- Columna de Contenido Principal + Footer -->
        <div class="flex flex-col flex-1 h-full overflow-hidden">
          <app-breadcrumbs [items]="breadcrumbSvc.breadcrumbs()" />

          <!-- MAIN: Scroll independiente -->
          <main class="flex-1 overflow-y-auto p-6 md:p-8 w-full mx-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-800">
            <router-outlet></router-outlet>
          </main>
          
          <!-- Footer -->
          <app-footer class="shrink-0"></app-footer>
        </div>

      </div>
    </div>
    <!-- Panel flotante de monitoreo -->
    <app-cache-devtools />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  /**
   * Injected tracking system service managing hierarchical breadcrumb mutations.
   * Feeds historical segments into the template view context reactively.
   */
  readonly breadcrumbSvc = inject(BreadcrumbService);
}