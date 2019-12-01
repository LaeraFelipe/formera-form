import { ValidationMessageSource } from "../types";

let messages = {
  required: 'Value is required.',
  maxLength: 'Text is too long. Must be {maxLength} characters or less.',
  minLength: 'Text is too small. Must be {minLength} characters or more.',
  max: 'Number is too big. Must be {min} or less.',
  min: 'Number is too small. Must be {min} or more.',
  email: 'Must be a valid email.'
}

/**Initialize the messages. */
export function setCustomMessages(customMessageSource: ValidationMessageSource) {
  messages = { ...messages, ...customMessageSource };
}

/**Return a validation message replacing values if the replacements paramater exists. */
export function getValidatorMessage(messageName: string, replacements?: any) {
  let message = messages[messageName];

  if (!message) {
    throw new Error(`Validation message "${messageName}" not exists!`);
  }

  if (replacements) {
    for (const key in replacements) {
      if (replacements[key]) {
        message = message.replace('{'.concat(key).concat('}'));
      }
    }
  }

  return message;
}