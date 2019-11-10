import { FieldState, ValidationMessageSource } from "../types";

/**Source of validation messages. */
let messages: ValidationMessageSource = {};

/**Set the messages to return in validator functions. */
export function setMessages(customMessages: ValidationMessageSource) {
  messages = customMessages;
}

//VALIDATORS

export function required(fieldState: FieldState, formValues: any, []): string {
  const { value } = fieldState;

  if (!value) {
    return messages.required
  }
}

export function maxLength(fieldState: FieldState, formValues: any, [length]): string {
  const { value } = fieldState;

  if (value) {
    if (value.length > length) {
      return messages.maxLength;
    }
  }
}

export function minLength(fieldState: FieldState, formValues: any, [length]): string {
  const { value } = fieldState;

  if (value) {
    if (value.length < length) {
      return messages.minLength;
    }
  }
}