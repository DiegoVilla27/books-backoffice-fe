import { IErrorMsg } from "@shared/components/ui/error-msg/error-msg.component";

/**
 * Validation messages mapping configuration for the account registration form.
 */
export const registerValidations: IErrorMsg = {
  name: [
    { type: "required", message: "El nombre es requerido" },
    { type: "minlength", message: "El nombre debe tener al menos 3 caracteres" },
    { type: "maxlength", message: "El nombre no debe exceder 50 caracteres" }
  ],
  lastname: [
    { type: "required", message: "El apellido es requerido" },
    { type: "minlength", message: "El apellido debe tener al menos 3 caracteres" },
    { type: "maxlength", message: "El apellido no debe exceder 50 caracteres" }
  ],
  age: [
    { type: "required", message: "La edad es requerida" },
    { type: "min", message: "La edad minima es 1" },
    { type: "max", message: "La edad maxima es 120" }
  ],
  email: [
    { type: "required", message: "El correo es requerido" },
    { type: "email", message: "El formato del correo es incorrecto" }
  ],
  password: [
    { type: "required", message: "La contraseña es requerida" },
    { type: "minlength", message: "La contraseña debe tener al menos 3 caracteres" },
    { type: "maxlength", message: "La contraseña no debe exceder 20 caracteres" }
  ],
  passwordConfirmation: [
    { type: "required", message: "La confirmación de la contraseña es requerida" },
    { type: "minlength", message: "La confirmación de la contraseña debe tener al menos 3 caracteres" },
    { type: "maxlength", message: "La confirmación de la contraseña no debe exceder 20 caracteres" },
    { type: "passwordMismatch", message: "Las contraseñas no coinciden." }
  ]
};