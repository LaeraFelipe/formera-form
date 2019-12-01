import { FieldState } from "../types";
import { getValidatorMessage } from "./messages";

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function required({ value }: FieldState, formValues: any, []): string {
  if (!value) {
    return getValidatorMessage('required');
  }
}

export function maxLength({ value }: FieldState, formValues: any, [length]): string {
  if (value) {
    if (value.length > length) {
      return getValidatorMessage('maxLength', { maxLength: length });
    }
  }
}

export function minLength({ value }: FieldState, formValues: any, [length]): string {
  if (value) {
    if (value.length < length) {
      return getValidatorMessage('minLength', { minLength: length });
    }
  }
}

export function min({ value }: FieldState, formValues: any, [min]): string {
  if (value) {
    if (value < min) {
      return getValidatorMessage('min', { min: min });
    }
  }
}

export function max({ value }: FieldState, formValues: any, [max]): string {
  if (value) {
    if (value > max) {
      return getValidatorMessage('max', { max: max });
    }
  }
}

export function email({ value }: FieldState, formValues: any, []) {
  if (!EMAIL_REGEX.test(value)) {
    return getValidatorMessage('email');
  }
}