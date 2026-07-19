import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormGroup, FormGroupDirective, NgControl } from '@angular/forms';
import { ErrorMsgComponent, IErrorMsg } from '@shared/components/ui/error-msg/error-msg.component';
import { combineLatest, merge, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ErrorMsgComponent],
  template: `
    <div class="flex flex-col gap-1.5 w-full">
      @if (label()) {
        <label
          [for]="id()"
          class="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono"
        >
          {{ label() }}
        </label>
      }

      <div class="relative w-full flex items-center">
        <input
          [autocomplete]="currentType() === 'password' ? 'new-password' : 'nope'"
          [id]="id()"
          [type]="currentType()"
          [placeholder]="placeholder()"
          [value]="value"
          [disabled]="disabled"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          [ngClass]="{
            'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30': hasError(),
            'border-zinc-900 focus:border-purple-500/50 focus:ring-purple-500/50': !hasError(),
            'pr-12': type() === 'password'
          }"
          class="w-full rounded-xl border bg-zinc-950 py-3 px-4 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      
      @if (parentForm() && controlName() && errorsMap()) {
        <validator-error-msg
          [form]="parentForm()!"
          [type]="controlName()!"
          [errorMessagesMap]="errorsMap()!"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  /** Unique ID applied to the input element and associated label descriptor. */
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  /** Optional descriptive label text displayed above the control field layout. */
  label = input<string | undefined>(undefined);
  /** Native functional input type layout variant specifier constraints. */
  type = input<'text' | 'email' | 'number' | 'password'>('text');
  /** Helper placeholder preview text string rendered when the data bound element is blank. */
  placeholder = input<string>('');
  /** Structural reference to the parent FormGroup containing the target control. */
  parentForm = input<FormGroup | undefined>(undefined);
  /** Strict property property string identifier name used to fetch control status entries. */
  controlName = input<string | undefined>(undefined);
  /** Error localized validation keys translation metadata structure. */
  errorsMap = input<IErrorMsg | undefined>(undefined);
  /** Output fired when the input element loses focus. Emits void. */
  blur = output<void>();

  /** Inner contextual value representation buffered from model bindings. */
  value: any = '';
  /** Runtime layout disabled interaction constraint status flag. */
  disabled = false;
  /** Internal tracking state signal for password visibility masking overrides. */
  private showPassword = signal<boolean>(false);

  /** Callback delegate reference used to broadcast upstream value mutations into reactive engines. */
  onChange: any = () => { };
  /** Callback delegate reference fired on blurred focus to propagate control touched attributes. */
  onTouch: any = () => { };

  /** Self structural control node reference descriptor injector token. */
  private ngControl = inject(NgControl, { optional: true, self: true });
  /** Optional form group ancestor context token utilized to intercept native submission flags. */
  private formDirective = inject(FormGroupDirective, { optional: true });

  /**
   * ⚡ PUENTE REACTIVO: Escucha cambios en parentForm/controlName para mapear el estado a una Signal.
   * Intercepts multi-stream changes, lifecycle operations, and execution pipeline events to structure 
   * a safe data state payload map without triggering manual change detection cycles.
   */
  private controlState = toSignal(
    combineLatest([
      toObservable(this.parentForm),
      toObservable(this.controlName)
    ]).pipe(
      switchMap(([form, name]) => {
        if (!form || !name) {
          return of({ invalid: false, dirty: false, touched: false, submitted: false });
        }
        const control = form.get(name);
        if (!control) {
          return of({ invalid: false, dirty: false, touched: false, submitted: false });
        }

        const trigger$ = merge(
          control.statusChanges,
          control.valueChanges,
          this.formDirective ? this.formDirective.ngSubmit : of(null)
        );

        return trigger$.pipe(
          map(() => ({
            invalid: control.invalid,
            dirty: control.dirty,
            touched: control.touched,
            submitted: this.formDirective?.submitted ?? false
          })),
          startWith({
            invalid: control.invalid,
            dirty: control.dirty,
            touched: control.touched,
            submitted: this.formDirective?.submitted ?? false
          })
        );
      })
    ),
    {
      initialValue: { invalid: false, dirty: false, touched: false, submitted: false }
    }
  );

  /**
   * ⚡ COMPUTED SIGNAL: Combina el estado síncrono del control con el envío del formulario raíz.
   * Safely monitors active validations states to dynamically switch visual validation flag states.
   */
  hasError = computed(() => {
    const state = this.controlState();
    return state.invalid && (state.dirty || state.touched || state.submitted);
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  /**
   * ⚡ COMPUTED SIGNAL: Dynamically evaluates the structural entry string type 
   * based on explicit properties configuration and reactive password visibility states.
   */
  currentType = computed(() => {
    if (this.type() === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type();
  });

  /**
   * Writes structural changes locally into view models variables bounds.
   * 
   * @param value - Incoming target value payload.
   */
  writeValue(value: any): void { this.value = value ?? ''; }

  /**
   * Attaches structural value modifications listeners downstream.
   * 
   * @param fn - Target callback engine runner.
   */
  registerOnChange(fn: any): void { this.onChange = fn; }

  /**
   * Attaches interaction constraints listeners downstream.
   * 
   * @param fn - Target callback engine runner.
   */
  registerOnTouched(fn: any): void { this.onTouch = fn; }

  /**
   * Toggles element visibility blocks state based on model permissions definitions.
   * 
   * @param isDisabled - Target status toggle flag.
   */
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }

  /**
   * Listens to element change input actions to normalize payloads strings prior to emitting streams.
   * 
   * @param event - DOM execution input payload interceptor.
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = this.type() === 'number' ? (target.value ? Number(target.value) : null) : target.value;
    this.onChange(this.value);
  }

  /**
   * Triggers control blur validations triggers hooks.
   */
  onBlur(): void {
    this.onTouch();
    this.blur.emit();
  }
}