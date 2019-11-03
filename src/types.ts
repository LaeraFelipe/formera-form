export interface FormOptions {
  initialValues: any,
  customValidators?: ValidatorSource,
  debug?: boolean
}

export interface FieldRegisterOptions {
  validationType?: 'onChange' | 'onBlur',
  validators?: Array<string | FieldValidator>,
}

export interface FieldEntrie {
  options: FieldRegisterOptions,
}

export type FieldEntries = {
  [field: string]: FieldEntrie
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
  [field: string]: FieldState
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
  [field: string]: FieldSubscription[]
}

export type FormSubscriptions = FormSubscription[];

export interface FieldHandler {
  onChange(value: any): void,
  onBlur(): void,
  onFocus(): void,
  subscribe(callback: FieldSubscriptionCallback, options?: FieldSubscriptionOptions): void,
}

export interface FieldValidator {
  name: string,
  params?: []
}

export type FieldValidatorFunction = (fieldState: FieldState, formValues: any, params: any) => string | Promise<string>;

export interface ValidatorSource {
  [name: string]: FieldValidatorFunction,
}