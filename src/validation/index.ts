import defaultMessages from "./messages";
import * as validatorsAndSetters from './validators';
import { ValidationFunctionSource, ValidationMessageSource } from "../types";

/**Initialize validators passing custom validators and custom messages. */
export default function initializeValidators(customValidators?: ValidationFunctionSource, customMessages?: ValidationMessageSource): ValidationFunctionSource {
  const messages = { ...defaultMessages, ...customMessages };
  const { setMessages, ...defaultValidators } = validatorsAndSetters;

  const validators = { ...defaultValidators, ...customValidators };

  setMessages(messages);

  return <ValidationFunctionSource><unknown>validators;
}