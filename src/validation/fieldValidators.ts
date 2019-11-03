import { FieldState } from "../types";
import { fieldValidationMessages } from "./validationMessages";

export function required(fieldState: FieldState, formValues: any, params: any): string {
  const { value } = fieldState;

  if (!value) {
    return fieldValidationMessages.required
  }
}

export function wait(fieldState: FieldState, formValues: any, params: any): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  })
}
