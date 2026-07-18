import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Controller component for the administration dashboard top header bar.
 * Provides user profile dropdown menu displays and navigations.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {

  /** Mock user profile data representation for layout bindings. */
  currentUser = {
    name: 'Diego Villa',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
  };

  /** Toggle state flag controlling visibility of the user dropdown menu overlay. */
  showUserMenu = signal<boolean>(false);


  /**
   * Toggles the user profile navigation menu overlay state.
   */
  toggleUserMenu() {
    this.showUserMenu.update(state => !state);
  }
}

