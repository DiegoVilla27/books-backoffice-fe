import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '@modules/admin/pages/dashboard/services/dashboard.service';
import { DashboardStats, RecentActivity } from '@modules/admin/pages/dashboard/interfaces';

/**
 * Controller component for the Dashboard portal summary view.
 * Coordinates metrics loading, logs lists summary, and triggers navigation actions.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  /** Stats metrics state structure. */
  stats: DashboardStats | null = null;
  /** Collection listing recent events. */
  activities: RecentActivity[] = [];
  /** loading indicator status flag. */
  isLoading = true;

  /** Injected Dashboard service provider. */
  private dashboardSvc = inject(DashboardService);
  /** Injected Router. */
  private router = inject(Router);

  /**
   * Initializes metrics queries on page load.
   */
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Dispatches concurrent calls to load stats and activities.
   */
  loadData(): void {
    this.isLoading = true;

    this.dashboardSvc.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.checkLoadingComplete();
      },
      error: () => { this.isLoading = false; }
    });

    this.dashboardSvc.getRecentActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
        this.checkLoadingComplete();
      },
      error: () => { this.isLoading = false; }
    });
  }

  /**
   * Private helper checking load completeness.
   */
  private checkLoadingComplete(): void {
    if (this.stats !== null && this.activities.length > 0) {
      this.isLoading = false;
    }
  }

  /**
   * Quick action redirection handler.
   * 
   * @param path - Target route string path.
   */
  navigateQuickAction(path: string): void {
    this.router.navigate([path]);
  }
}
