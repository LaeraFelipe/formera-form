import { FormState, FieldState } from "./types";

export const initialFormState: FormState = {
  touched: false,
  dirty: false,
  pristine: true,
  validating: false,
  valid: true,
  submitting: false,
  initialValues: null,
  previousValues: null,
  values: null,
  errors: {},
}

export const initialFieldState: FieldState = {
  active: false,
  touched: false,
  dirty: false,
  pristine: true,
  validating: false,
  valid: true,
  disabled: false,
  initialValue: null,
  previousValue: null,
  value: null,
  error: null
}