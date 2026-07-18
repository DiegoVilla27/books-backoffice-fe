import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Directive that appends a dynamic clear (X) button to a standard text input control.
 *
 * @remarks
 * Wraps inputs inside absolute wrapper containers dynamically, updating bound Angular control models on clear.
 */
@Directive({
  selector: '[appClearableInput]',
  standalone: true,
})
export class ClearableInputDirective implements OnInit, OnDestroy {
  /** ElementRef helper reference to the host input component. */
  private el = inject(ElementRef);
  /** Renderer2 reference to safely execute DOM manipulations. */
  private renderer = inject(Renderer2);

  /** Optional reactive forms controller binding target. */
  private ngControl = inject(NgControl, { optional: true });

  /** Dynamically created clear button node elements. */
  private clearButton!: HTMLButtonElement;
  /** Dynamically created wrapper container node elements. */
  private wrapper!: HTMLDivElement;

  /**
   * Initializes structural wrapping changes on view instantiation.
   */
  ngOnInit(): void {
    this.wrapInput();
    this.createClearButton();
    this.toggleButtonVisibility(this.el.nativeElement.value);
  }

  /**
   * Cleans references and removes element listeners to avoid memory leaks.
   */
  ngOnDestroy(): void {
    if (this.clearButton) {
      this.clearButton.remove();
    }
  }

  /**
   * Wraps the input field inside a relative division block element.
   */
  private wrapInput(): void {
    const inputEl = this.el.nativeElement;
    const parent = inputEl.parentNode;

    this.wrapper = this.renderer.createElement('div');
    this.renderer.addClass(this.wrapper, 'relative');
    this.renderer.addClass(this.wrapper, 'w-full');

    this.renderer.insertBefore(parent, this.wrapper, inputEl);
    this.renderer.appendChild(this.wrapper, inputEl);
  }

  /**
   * Dynamically constructs the button with visual X layouts.
   */
  private createClearButton(): void {
    this.clearButton = this.renderer.createElement('button');
    this.clearButton.type = 'button';

    const classes = [
      'absolute', 'right-3', 'top-1/2', '-translate-y-1/2',
      'text-zinc-500', 'hover:text-zinc-300', 'transition-colors',
      'focus:outline-none', 'p-1', 'rounded-md', 'hover:bg-zinc-800/50'
    ];
    classes.forEach(cls => this.renderer.addClass(this.clearButton, cls));

    this.clearButton.innerHTML = `
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;

    this.renderer.listen(this.clearButton, 'click', (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.clearInput();
    });

    this.renderer.appendChild(this.wrapper, this.clearButton);
  }

  /**
   * Host listener tracking value variations on inputs to update clear button visibility.
   *
   * @param value - The input text value string.
   */
  @HostListener('input', ['$event.target.value'!])
  onInput(value: string): void {
    this.toggleButtonVisibility(value);
  }

  /**
   * Empties input field contents and propagates modifications.
   */
  private clearInput(): void {
    const inputEl = this.el.nativeElement;

    this.renderer.setProperty(inputEl, 'value', '');

    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue('');
    }

    inputEl.dispatchEvent(new Event('input'));

    this.toggleButtonVisibility('');
    inputEl.focus();
  }

  /**
   * Toggles visibilities of the dynamic clear button element.
   *
   * @param value - The active input text string.
   */
  private toggleButtonVisibility(value: string): void {
    if (!this.clearButton) return;

    if (value && value.trim().length > 0) {
      this.renderer.removeClass(this.clearButton, 'hidden');
    } else {
      this.renderer.addClass(this.clearButton, 'hidden');
    }
  }
}