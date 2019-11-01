export interface FormOptions {
  initialValues: any,
  debug?: boolean
}

export interface FormState {
  touched: boolean,
  dirty: boolean,
  pristine: boolean,
  valid: boolean,
  validating: boolean,
  submitting: boolean,
  initialValues: any,
  previousValues: any,
  values: any,
  errors?: { [key: string]: string },
}

export interface FieldState {
  active: boolean,
  touched: boolean,
  dirty: boolean,
  pristine: boolean,
  valid: boolean,
  validating: boolean,
  disabled: boolean,
  error?: string,
  initialValue: any,
  previousValue: any,
  value: any,
  data?: any,
}

export type FieldStates = {
  [key: string]: FieldState
}

export type FieldSubscriptionCallback = (fieldState: FieldState, formValues: any) => void;

export interface FieldEntrie {
  name: string,
  subscriptions: Array<FieldSubscriptionCallback>,
}

export interface FieldEntries {
  [key: string]: FieldEntrie;
}

export interface FieldRegisterOptions {
 
}

export interface FieldHandler {
  onChange(value: any): void,
  onBlur(): void,
  onFocus(): void
}