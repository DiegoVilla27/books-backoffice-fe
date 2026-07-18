import { IErrorMsg } from "@shared/components/ui/error-msg/error-msg.component";

/**
 * Validation messages mapping configuration for the login credentials form.
 */
export const loginValidations: IErrorMsg = {
  email: [
    { type: "required", message: "El correo es requerido" },
    { type: "email", message: "El formato del correo es incorrecto" }
  ],
  password: [
    { type: "required", message: "La contraseña es requerida" }
  ]
};