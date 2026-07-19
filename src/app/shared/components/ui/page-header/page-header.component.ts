import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

/**
 * Reusable presentation header component designed to standardize top-level page views.
 * Renders contextual typography slots alongside a semantic, reactive call-to-action trigger.
 * 
 * @remarks
 * Built using Angular Signals to ensure minimal view projection footprints and optimal execution bounds.
 * Integrates an inline SVG plus symbol coupled with a wrapped custom button interface to orchestrate
 * outward routing flows cleanly.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  template: `
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-zinc-100">{{ title() }}</h1>
        <p class="text-sm text-zinc-500 mt-1">{{ description() }}</p>
      </div>

      @if (showNewButton()) {
        <app-button [routerLink]="routeNewData()">
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Nuevo Usuario
        </app-button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  /** Target destination route string parameter passed down to bound navigation buttons. */
  readonly routeNewData = input<string>();
  /** Flag to show new button */
  showNewButton = input<boolean>(true);
  /** Primary screen title string displayed within standard prominent headings. */
  readonly title = input<string>();
  /** Secondary micro-copy narrative string positioned below the main title viewport frame. */
  readonly description = input<string>();
}