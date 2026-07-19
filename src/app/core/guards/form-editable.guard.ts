import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { FormEditableComponent } from '@core/interfaces/form-editable';
import { ToastService } from '@core/services/toast.service';

/**
 * Universal route-deactivation guard that intercepts navigation triggers away from uncommitted states.
 * Evaluates the structural lifecycle of components carrying the {@link EditableComponent} signature.
 * 
 * @param component - The active instance implementation target of the view framework.
 * @returns True if navigation is safe to proceed, false or an observable stream if blocked by user confirmation.
 */
export const formEditableGuard: CanDeactivateFn<FormEditableComponent> = (component) => {
  const toastSvc = inject(ToastService);

  // 1. Si el componente no implementa el método o no tiene cambios, se permite la salida de inmediato
  if (!component || !component.isDirty || !component.isDirty()) {
    return true;
  }

  // 2. BLINDAJE SENIOR: Aquí puedes inyectar un servicio de diálogos/modales customizado (ej: MatDialog o tu ToastService custom)
  // De momento, usamos la confirmación nativa del navegador de forma síncrona.
  const confirmDiscard = toastSvc.confirm(
    'Tienes cambios sin guardar en el formulario.',
    '¿Estás seguro de que deseas salir y perder las modificaciones?'
  );

  return confirmDiscard;
};
