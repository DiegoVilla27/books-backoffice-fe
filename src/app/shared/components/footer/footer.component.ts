import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Controller component for the layout footer section.
 * Automatically resolves and displays the current calendar year.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  /** The current year calculated dynamically on component instantiation. */
  currentYear: number = new Date().getFullYear();
}

