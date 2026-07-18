import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Visual variant styles available for the custom button component. */
export type ButtonVariant = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
/** Standard HTML button type attributes. */
export type ButtonType = 'button' | 'submit' | 'reset';
/** Icon alignment positions within the button text stack. */
export type IconPosition = 'left' | 'right';

/**
 * Reusable, customizable button component designed with modern glassmorphic hover gradient overlays.
 *
 * @remarks
 * Uses Angular Signals to computed classes and lazy-load visual variations safely.
 *
 * @example
 * ```html
 * <app-button variant="primary" (btnClick)="submitForm($event)">
 *   Save Record
 * </app-button>
 * ```
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /** Visual variant theme style configuration. */
  variant = input<ButtonVariant>('primary');
  /** HTML element type tag configuration. */
  type = input<ButtonType>('button');
  /** Flag representing if interaction with the button is disabled. */
  disabled = input<boolean>(false);
  /** Layout alignment direction for optional content icons. */
  iconPosition = input<IconPosition>('left');

  /** Output callback event triggered on successful clicks. */
  btnClick = output<MouseEvent>();

  /**
   * Computed string containing the list of Tailwind CSS styles mapped to the selected variant.
   *
   * @remarks
   * Evaluates only when the `variant` or `disabled` signals update.
   */
  buttonClasses = computed(() => {
    const baseClasses = 'w-full relative group overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]',
      secondary: 'bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700/80 hover:text-white',
      info: 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]',
      success: 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)] hover:shadow-[0_0_25px_rgba(5,150,105,0.5)]',
      warning: 'bg-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]',
      error: 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)]'
    };

    return `${baseClasses} ${variants[this.variant()]}`;
  });

  /**
   * Computed string representing the gradient classes applied to the hover glass overlay layer.
   */
  gradientClasses = computed(() => {
    const gradients: Record<ButtonVariant, string> = {
      primary: 'from-purple-400 to-indigo-500',
      secondary: 'from-zinc-700 to-zinc-600',
      info: 'from-blue-500 to-sky-500',
      success: 'from-emerald-500 to-teal-500',
      warning: 'from-amber-400 to-yellow-500',
      error: 'from-rose-500 to-red-500'
    };
    return `absolute inset-0 bg-gradient-to-r ${gradients[this.variant()]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`;
  });

  /**
   * Handles button click actions internally and propagates the event if not disabled.
   *
   * @param event - Mouse click event capture payload.
   */
  onClick(event: MouseEvent): void {
    if (!this.disabled()) {
      this.btnClick.emit(event);
    }
  }
}