import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { menuItems, NavItem } from './data';

/**
 * Controller component for the administration collapsible sidebar navigation bar.
 */
@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './aside.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsideComponent {
  /** Responsive drawer toggle parameter passed by ancestor layouts. */
  isOpenMobile = input<boolean>(false);

  /** Visual state tracker flag representing if sidebar is collapsed or expanded. */
  isCollapsed = signal<boolean>(false);

  /** Decoupled structural list mapping sidebar navigation routes and icons. */
  menuItems = signal<NavItem[]>(menuItems);

  /**
   * Toggles the collapsible navigation panel width view state.
   */
  toggleSidebar() {
    this.isCollapsed.update(state => !state);
  }
}

