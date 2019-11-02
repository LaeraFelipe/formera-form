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
  values: any,
  errors?: { [key: string]: string },
  previousState: Omit<FormState, 'previousState'>,
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
  value: any,
  data?: any,
  previousState: Omit<FormState, 'previousState'>,
}

export type FieldStates = {
  [key: string]: FieldState
}

export interface FieldSubscriptionOptions {
  active?: boolean,
  touched?: boolean,
  dirty?: boolean,
  pristine?: boolean,
  valid?: boolean,
  validating?: boolean,
  disabled?: boolean,
  error?: boolean,
  initialValue?: boolean,
  value?: boolean,
  data?: boolean,
}

export interface FormSubscriptionOptions {
  touched?: boolean,
  dirty?: boolean,
  pristine?: boolean,
  valid?: boolean,
  validating?: boolean,
  submitting?: boolean,
  initialValues?: boolean,
  values?: boolean,
  errors?: boolean,
}

export type FieldSubscriptionCallback = (fieldState: FieldState) => void;

export type FormSubscriptionCallback = (formState: FormState) => void;

export interface FieldSubscription {
  options: FieldSubscriptionOptions,
  callback: FieldSubscriptionCallback
}

export interface FormSubscription {
  options: FormSubscriptionOptions,
  callback: FormSubscriptionCallback
}

export type FieldSubscriptions = {
  [key: string]: FieldSubscription[]
}

export type FormSubscriptions = FormSubscription[];

export interface FieldRegisterOptions {

}

export interface FieldHandler {
  onChange(value: any): void,
  onBlur(): void,
  onFocus(): void
  subscribe(callback: FieldSubscriptionCallback, options?: FieldSubscriptionOptions): void,
}