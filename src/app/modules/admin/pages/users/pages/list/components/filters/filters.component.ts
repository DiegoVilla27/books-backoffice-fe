import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { SearchComponent } from '@shared/components/ui/search/search.component';
import { SelectComponent, SelectOption } from '@shared/components/ui/select/select.component';

/**
 * Component controller for the Users Directory listing search and filter panel layouts.
 *
 * @remarks
 * Coordinates two-way model binding signals for roles, active status, and search keywords.
 */
@Component({
  selector: 'app-users-filters',
  standalone: true,
  imports: [
    SelectComponent,
    FormsModule,
    ButtonComponent,
    SearchComponent
  ],
  templateUrl: './filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFiltersComponent {
  /** Two-way model binding signal representing the current active search keyword. */
  searchTerm = model.required<string>();
  /** Input lookup options mapping system user role categories. */
  roles = input.required<SelectOption[]>();
  /** Two-way model binding signal representing the selected user role filter option. */
  selectedRole = model.required<string>();
  /** Input lookup options mapping account status values. */
  status = input.required<SelectOption[]>();
  /** Two-way model binding signal representing the selected active status filter option. */
  selectedStatus = model.required<string>();

  /** Output event triggered when the clear/reset filters action button is clicked. */
  resetFilters = output<void>();
}
