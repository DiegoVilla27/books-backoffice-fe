import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb } from '@core/services/breadcrumb.service';

/**
 * Presentational navigation component responsible for rendering hierarchical path tracks (breadcrumbs).
 * Utilizes Angular Signals for high-performance reactive UI updates under the OnPush strategy.
 * 
 * @remarks
 * This layout component loops over a structured list of breadcrumb segments, dynamically switching 
 * typography styles for the current active leaf node (`$last`) and inserting structural route separators.
 */
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <div class="px-6 h-[55px] flex items-center md:px-8 border-b border-zinc-900/60">
      <nav
        class="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-500 uppercase"
      >
        @for (item of items(); track $index; let l = $last) {
          <a
            [routerLink]="item.url"
            class="hover:text-purple-400 transition-colors"
            [ngClass]="{
              'text-purple-400 font-medium': l,
              'text-zinc-500': !l,
            }"
          >
            {{ item.label }}
          </a>
          @if (!l) {
            <span class="text-zinc-700">/</span>
          }
        }
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  /** 
   * Required signal collection containing the active route hierarchy segments mapped by the tracking core engine. 
   */
  items = input.required<Breadcrumb[]>();
}