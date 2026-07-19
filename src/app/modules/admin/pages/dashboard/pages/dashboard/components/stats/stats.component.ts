import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '@modules/admin/pages/dashboard/services/dashboard.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      @if (dashboardSvc.loadingStats()) {
        <!-- SKELETON: Total Usuarios -->
        <div
          class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 backdrop-blur-md flex items-center justify-between animate-pulse"
        >
          <div class="space-y-3 flex-1">
            <div class="h-3 bg-zinc-800 rounded-md w-24"></div>
            <div class="h-8 bg-zinc-800 rounded-lg w-16"></div>
            <div class="h-3 bg-zinc-800/60 rounded-md w-36"></div>
          </div>
          <div
            class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 h-12 w-12 shrink-0"
          ></div>
        </div>

        <!-- SKELETON: Total Libros -->
        <div
          class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 backdrop-blur-md flex items-center justify-between animate-pulse"
        >
          <div class="space-y-3 flex-1">
            <div class="h-3 bg-zinc-800 rounded-md w-24"></div>
            <div class="h-8 bg-zinc-800 rounded-lg w-20"></div>
            <div class="h-3 bg-zinc-800/60 rounded-md w-32"></div>
          </div>
          <div
            class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 h-12 w-12 shrink-0"
          ></div>
        </div>

        <!-- SKELETON: Salud Servidor -->
        <div
          class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 backdrop-blur-md flex items-center justify-between animate-pulse"
        >
          <div class="space-y-3 flex-1">
            <div class="h-3 bg-zinc-800 rounded-md w-28"></div>
            <div class="h-6 bg-zinc-800 rounded-lg w-24 mt-2"></div>
            <div class="h-3 bg-zinc-800/60 rounded-md w-36"></div>
          </div>
          <div
            class="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 h-12 w-12 shrink-0"
          ></div>
        </div>
      } @else {
        <!-- CARD REAL: Total Usuarios -->
        <div
          class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 backdrop-blur-md flex items-center justify-between group hover:border-purple-500/20 transition-all duration-300"
        >
          <div>
            <p
              class="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono"
            >
              Total Usuarios
            </p>
            <h3 class="text-3xl font-bold text-zinc-100 mt-2 font-mono">
              {{ dashboardSvc.stats()?.totalUsers }}
            </h3>
            <p class="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1">
              <span class="text-purple-400">●</span> Perfiles del ecosistema
            </p>
          </div>
          <div
            class="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          </div>
        </div>

        <!-- CARD REAL: Total Libros -->
        <div
          class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 backdrop-blur-md flex items-center justify-between group hover:border-purple-500/20 transition-all duration-300"
        >
          <div>
            <p
              class="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono"
            >
              Total Libros
            </p>
            <h3 class="text-3xl font-bold text-zinc-100 mt-2 font-mono">
              {{ dashboardSvc.stats()?.totalBooks }}
            </h3>
            <p class="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1">
              <span class="text-purple-400">●</span> Catálogo bibliográfico
            </p>
          </div>
          <div
            class="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        </div>

        <!-- CARD REAL: Estado del Sistema -->
        <div
          class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900/80 backdrop-blur-md flex items-center justify-between group hover:border-purple-500/20 transition-all duration-300"
        >
          <div>
            <p
              class="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono"
            >
              Salud Servidor
            </p>
            <h3
              class="text-xl font-bold text-emerald-400 mt-3 flex items-center gap-1.5 uppercase font-mono"
            >
              <span class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
                ></span>
              </span>
              EXCELLENT
            </h3>
            <p class="text-[10px] text-zinc-500 mt-2 flex items-center gap-1">
              <span>●</span> Latencia óptima de API
            </p>
          </div>
          <div
            class="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsComponent implements OnInit {
  readonly dashboardSvc = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardSvc.getStats();
  }
}
