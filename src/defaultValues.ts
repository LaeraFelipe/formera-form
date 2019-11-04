import { FormState, FieldState, FormSubscriptionOptions, FieldSubscriptionOptions, FieldRegisterOptions } from "./types";

export const defaultFormState: FormState = {
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
  initialValue: null,
  value: '',
  error: null,
  previousState: null,
}

export const defaultFieldSubscriptionOptions: FieldSubscriptionOptions = {
  active: true,
  dirty: true,
  disabled: true,
  error: true,
  pristine: true,
  touched: true,
  valid: true,
  validating: true,
  value: true,
  initialValue:false,
  data: false
}

export const defaultFormSubscriptionOptions: FormSubscriptionOptions = {
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

export const defaultFieldRegisterOptions: FieldRegisterOptions = {
  validators: null
}
