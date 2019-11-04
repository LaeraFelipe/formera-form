import { FieldState } from "../types";
import messages from "./messages";

export function required(fieldState: FieldState, formValues: any, []): string {
  const { value } = fieldState;

  if (!value) {
    return messages.required
  }
}

export function maxLength(fieldState: FieldState, formValues: any, [length]): string {
  const { value } = fieldState;

  if (value) {
    if (value.length > length){
      return messages.maxLength;
    }
  }
}

export function minLength(fieldState: FieldState, formValues: any, [length]): string {
  const { value } = fieldState;

  if (value) {
    if (value.length < length){
      return messages.minLength;
    }
  }
}