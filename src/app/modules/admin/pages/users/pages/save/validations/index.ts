import { IErrorMsg } from "@shared/components/ui/error-msg/error-msg.component";

/**
 * Validation messages mapping configuration for the User Profile edit details form.
 */
export const userValidations: IErrorMsg = {
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
  email: [
    { type: "required", message: "El correo electrónico es requerido" },
    { type: "pattern", message: "El correo electrónico debe ser válido" },
    { type: "emailExists", message: "El correo electrónico ya está registrado" }
  ],
  password: [
    { type: "required", message: "La contraseña es requerida" },
    { type: "minlength", message: "La contraseña debe tener al menos 3 caracteres" },
    { type: "maxlength", message: "La contraseña no debe exceder 20 caracteres" }
  ],
  age: [
    { type: "required", message: "La edad es requerida" },
    { type: "min", message: "La edad debe ser mayor o igual a 18" },
    { type: "max", message: "La edad debe ser menor o igual a 100" }
  ],
  role: [
    { type: "required", message: "El rol es requerido" }
  ],
  isActive: [
    { type: "required", message: "El estado es requerido" }
  ]
};