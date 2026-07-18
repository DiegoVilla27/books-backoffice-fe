import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs/operators';
import { AutoDestroyBase } from '@core/classes/auto-destroy';
import { ClearableInputDirective } from '@shared/directives/clearable-input.directive';
import { InputComponent } from '@shared/components/ui/input/input.component';

/**
 * Reusable, high-performance search input component with self-contained debounce logic.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ClearableInputDirective, InputComponent],
  template: `
    <div class="relative w-full">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 z-10"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z"
          />
        </svg>
      </div>
      <app-input
        type="text"
        appClearableInput
        [ngModel]="rawValue()"
        (ngModelChange)="onValueChange($event)"
        [placeholder]="placeholder()"
        class="[&_input]:pl-10 block w-full"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent extends AutoDestroyBase {
  /** Two-way model binding signal representing the debounced search term. */
  value = model<string>('');
  /** Input helper hint placeholder text string. */
  placeholder = input<string>('Buscar...');
  /** Input debounce time duration in milliseconds. Defaults to 350. */
  debounceTime = input<number>(350);

  /** Output event emitted only after the specified debounce duration. */
  search = output<string>();

  /** Local raw input value signal to update input instantly. */
  rawValue = signal<string>('');

  /** Internal RxJS subject handling the query text stream. */
  private search$ = new BehaviorSubject<string>('');

  constructor() {
    super();

    // Synchronize parent updates (like resets) to local raw value
    effect(() => {
      const parentVal = this.value();
      if (parentVal !== this.rawValue()) {
        this.rawValue.set(parentVal);
      }
    }, { allowSignalWrites: true });

    this.search$.pipe(
      skip(1),
      debounceTime(this.debounceTime()),
      distinctUntilChanged(),
      this.drop()
    ).subscribe((val) => {
      this.value.set(val);
      this.search.emit(val);
    });
  }

  /**
   * Updates the raw value and pushes the latest term to the debounce stream.
   *
   * @param val - The updated raw search term value.
   */
  onValueChange(val: string): void {
    this.rawValue.set(val);
    this.search$.next(val);
  }
}
