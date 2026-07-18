import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, FormGroup, FormGroupDirective, FormsModule, NgControl } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ErrorMsgComponent, IErrorMsg } from '@shared/components/ui/error-msg/error-msg.component';
import { combineLatest, merge, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

/**
 * Options interface representing selectable items in the dropdown menu.
 */
export interface SelectOption {
  /** The display text shown in the dropdown option lists. */
  label: string;
  /** The underlying raw value mapped to the controller binding model. */
  value: any;
}

/**
 * Custom form select dropdown component implementing `ControlValueAccessor` for seamless template-driven/reactive form bindings.
 *
 * @remarks
 * Supports Angular CDK virtual scrolling lists for large option datasets and custom error validation mappings.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ScrollingModule, FormsModule, ErrorMsgComponent],
  template: `
    <div class="flex flex-col gap-1.5 w-full relative">
      <!-- Label -->
      @if (label()) {
        <label [for]="id()" class="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          {{ label() }}
        </label>
      }
      
      <!-- Botón del Dropdown Custom Único -->
      <button
        type="button"
        [id]="id()"
        [disabled]="disabled"
        (click)="toggleDropdown()"
        (blur)="onBlur()"
        class="flex items-center justify-between w-full rounded-xl border py-3 px-3.5 text-sm text-left transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        [ngClass]="{
          'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30': hasError(),
          'border-zinc-900 focus:border-purple-500/50 focus:ring-purple-500/50': !hasError(),
          'text-zinc-200': selectedValue(),
          'text-zinc-500': !selectedValue()
        }"
      >
        <span class="truncate">{{ selectedLabel() }}</span>
        <!-- Icono de flecha (Chevron) -->
        <svg 
          class="h-4 w-4 text-zinc-500 transition-transform duration-200" 
          [class.rotate-180]="isOpen()"
          fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <!-- Contenedor Flotante de Opciones (Posicionado con top-full para evitar desajustes) -->
      @if (isOpen()) {
        <div class="absolute left-0 right-0 z-50 top-full mt-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl overflow-hidden">
          @if (virtualized()) {
            <ng-container>
              <cdk-virtual-scroll-viewport [itemSize]="40" class="h-48 overflow-y-auto custom-scrollbar">
                <div (click)="selectCustomOption('')" class="flex items-center px-3 h-10 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 rounded-lg cursor-pointer transition-colors">
                  {{ placeholder() }}
                </div>
                <div 
                  *cdkVirtualFor="let option of options()" 
                  (click)="selectCustomOption(option.value)"
                  class="flex items-center px-3 h-10 text-sm rounded-lg cursor-pointer transition-colors select-none"
                  [ngClass]="{
                    'bg-purple-600/20 text-purple-400 font-medium': selectedValue() === option.value,
                    'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200': selectedValue() !== option.value
                  }"
                >
                  <span class="truncate">{{ option.label }}</span>
                </div>
              </cdk-virtual-scroll-viewport>
            </ng-container>
          }
          @else {
            <div class="max-h-48 overflow-y-auto custom-scrollbar">
              <div 
                (click)="selectCustomOption('')"
                class="flex items-center px-3 h-10 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 rounded-lg cursor-pointer transition-colors"
              >
                {{ placeholder() }}
              </div>

              @for (option of options(); track option.value) {
                <div
                  (click)="selectCustomOption(option.value)"
                  class="flex items-center px-3 h-10 text-sm rounded-lg cursor-pointer transition-colors select-none"
                  [ngClass]="{
                    'bg-purple-600/20 text-purple-400 font-medium': selectedValue() === option.value,
                    'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200': selectedValue() !== option.value
                  }"
                >
                  <span class="truncate">{{ option.label }}</span>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Backdrop Invisible para cerrar al hacer clic fuera -->
       @if (isOpen()) {
          <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>
       }

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
export class SelectComponent implements ControlValueAccessor {
  /** Unique ID applied identifier used to bind custom labels to control inputs. */
  id = input<string>(`select-${Math.random().toString(36).substring(2, 9)}`);
  /** Label header text displayed above the control box. */
  label = input<string | undefined>(undefined);
  /** Inner helper hint placeholder text displayed when no selection value is bound. */
  placeholder = input<string>('Seleccionar opción...');
  /** Array containing the source dropdown selectable configurations list. */
  options = input<SelectOption[]>([]);
  /** Flag representing if CDK virtualization scrolling features should be active. */
  virtualized = input<boolean>(false);

  /** Validation parent form group reference. */
  parentForm = input<FormGroup | undefined>(undefined);
  /** Target control string property name. */
  controlName = input<string | undefined>(undefined);
  /** Validation errors string mappings. */
  errorsMap = input<IErrorMsg | undefined>(undefined);

  /** Selected option raw bound value representation. */
  value: any = '';
  /** Disabled control interaction status state flag. */
  disabled = false;
  /** Active visibility state of the floating options dropdown. */
  isOpen = signal<boolean>(false);

  /** Active value signal used to compute layout selection states. */
  selectedValue = signal<any>('');

  /** Computed string containing the label representation of the active selected item. */
  selectedLabel = computed(() => {
    const currentVal = this.selectedValue();
    const active = this.options().find(opt => opt.value == currentVal);
    return active ? active.label : this.placeholder();
  });

  /** Internal change callback listener delegate function placeholder. */
  onChange: any = () => { };
  /** Internal touched callback listener delegate function placeholder. */
  onTouch: any = () => { };

  /** Self Angular control descriptor token reference. */
  private ngControl = inject(NgControl, { optional: true, self: true });
  /** Optional form group ancestor context token utilized to intercept native submission flags. */
  private formDirective = inject(FormGroupDirective, { optional: true });

  /**
   * ⚡ PUENTE REACTIVO: Escucha cambios en parentForm/controlName para mapear el estado a una Signal.
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
   * Writes value to view controls model bindings.
   *
   * @param value - The fresh value to map.
   */
  writeValue(value: any): void {
    this.selectedValue.set(value ?? '');
    this.value = value ?? '';
  }

  /**
   * Registers callback function that executes on value modifications.
   *
   * @param fn - Callback parameter handler.
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registers callback function that executes on control touch operations.
   *
   * @param fn - Callback parameter handler.
   */
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  /**
   * Toggles disabled states on this component.
   *
   * @param isDisabled - The target disabled status flag.
   */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Swaps current active visibility dropdown status flag representation.
   */
  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
    }
  }

  /**
   * Updates state value properties and propagates changes to listeners.
   *
   * @param val - Selected option value representation.
   */
  selectCustomOption(val: any): void {
    this.selectedValue.set(val);
    this.value = val;
    this.onChange(val);
    this.isOpen.set(false);
  }

  /**
   * Fires on control blur and triggers touched listener functions.
   */
  onBlur(): void {
    this.onTouch();
  }
}