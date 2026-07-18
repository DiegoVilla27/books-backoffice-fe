import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { SearchComponent } from '@shared/components/ui/search/search.component';
import { SelectComponent, SelectOption } from '@shared/components/ui/select/select.component';

/**
 * Component controller for the Books listing search and filter panel layouts.
 *
 * @remarks
 * Uses two-way model binding Signals for user selections and search text terms.
 */
@Component({
  selector: 'app-books-filters',
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
export class BooksFiltersComponent {
  /** Two-way model binding signal representing the selected user creator lookup filter. */
  selectedUser = model.required<string>();
  /** Two-way model binding signal representing the current active search keyword. */
  searchTerm = model.required<string>();
  /** Input lookup options list containing registered users database records. */
  users = input.required<SelectOption[]>();

  /** Output event triggered when the clear/reset filters action button is clicked. */
  resetFilters = output<void>();
}
