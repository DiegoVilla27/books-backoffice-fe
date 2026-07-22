import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTES_MAPPING } from '@core/interfaces/routes-mapping';
import { AuthService } from '@modules/auth/services/auth.service';

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
  /** Event emitted when mobile toggle button is clicked. */
  readonly toggleMenu = output<void>();

  /** Temporary image used as placeholder avatar for layout mockups. */
  avatarTemp: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

  /** Toggle state flag controlling visibility of the user dropdown menu overlay. */
  showUserMenu = signal<boolean>(false);

  /** 
   * Injects the Authentication service for user session management.
   */
  readonly authSvc = inject(AuthService);

  /** 
   * The route for the dashboard section of the application.
   */
  readonly routeDashboard = ROUTES_MAPPING.admin.dashboard;

  /**
   * Toggles the user profile navigation menu overlay state.
   */
  toggleUserMenu() {
    this.showUserMenu.update(state => !state);
  }

  /**
   * Logs out the current user and redirects to the login page.
   */
  logout() {
    this.authSvc.logout();
  }
}

