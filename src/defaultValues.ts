import { FormState, FieldState, FormSubscriptionOptions, FieldSubscriptionOptions, FieldRegisterOptions, FormOptions } from "./types";

export const defaultFormState: FormState = {
  active: false,
  disabled: false,
  touched: false,
  dirty: false,
  pristine: true,
  validating: false,
  valid: true,
  submitting: false,
  initialValues: null,
  values: null,
  errors: {},
  previousState: null,
}

export const defaultFieldState: FieldState = {
  active: false,
  touched: false,
  dirty: false,
  pristine: true,
  validating: false,
  valid: true,
  disabled: false,
  submitting: false,
  initial: null,
  value: '',
  error: null,
  errors: {},
  previousState: null,
}

export const defaultFieldSubscriptionOptions: FieldSubscriptionOptions = {
  active: true,
  dirty: true,
  disabled: true,
  pristine: true,
  touched: true,
  valid: true,
  validating: true,
  error: true,
  errors: true,
  value: true,
  initial: false,
  data: false
}

export const defaultFormSubscriptionOptions: FormSubscriptionOptions = {
  active: true,
  dirty: true,
  errors: true,
  pristine: true,
  submitting: true,
  touched: true,
  valid: true,
  validating: true,
  values: true,
  initialValues: false
}

export const defaultFormOptions: FormOptions = {
  debug: false,
  validationType: 'onChange',
  initialValues: {}
} as FormOptions

export const defaultFieldRegisterOptions: FieldRegisterOptions = {
  validators: null,
  stopValidationOnFirstError: true,
  validationType: 'onChange',
}
