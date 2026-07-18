import { IErrorMsg } from "@shared/components/ui/error-msg/error-msg.component";

/**
 * Validation messages mapping configuration for the Books details and owner form.
 */
export const bookValidations: IErrorMsg = {
  title: [
    { type: "required", message: "El título es requerido" },
    { type: "minlength", message: "El título debe tener al menos 3 caracteres" },
    { type: "maxlength", message: "El título no debe exceder 100 caracteres" }
  ],
  author: [
    { type: "required", message: "El autor es requerido" },
    { type: "minlength", message: "El autor debe tener al menos 2 caracteres" },
    { type: "maxlength", message: "El autor no debe exceder 100 caracteres" }
  ],
  userId: [
    { type: "required", message: "El usuario es requerido" }
  ]
};