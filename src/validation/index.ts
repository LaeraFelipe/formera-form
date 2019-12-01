import * as defaultValidators from './validators';
import { ValidationFunctionSource, ValidationMessageSource } from "../types";
import { setCustomMessages } from './messages';

/**Initialize validators passing custom validators and custom messages. */
export default function initializeValidators(customValidators?: ValidationFunctionSource, customMessages?: ValidationMessageSource): ValidationFunctionSource {
  setCustomMessages(customMessages);
  const validators = { ...defaultValidators, ...customValidators };
  
  return <ValidationFunctionSource><unknown>validators;
}