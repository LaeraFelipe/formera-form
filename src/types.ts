export interface FormOptions {
  initialValues: any,
  onSubmit: (values: any) => any,
  customValidators?: ValidatorSource,
  validationType?: 'onChange' | 'onBlur',
  debug?: boolean
}

export interface FieldRegisterOptions {
  validationType?: 'onChange' | 'onBlur',
  validators?: Array<string | FieldValidator>,
  stopValidationOnFirstError?: boolean,
}

export interface FieldEntrie {
  options: FieldRegisterOptions,
  handler?: InputHandlers,
}

export type FieldEntries = {
  [field: string]: FieldEntrie
}

export interface CommonState {
  active: boolean,
  touched: boolean,
  pristine: boolean,
  dirty: boolean,
  valid: boolean,
  validating: boolean,
  submitting: boolean,
}

export interface FormState extends CommonState {
  initialValues: any,
  values: any,
  previousState: Omit<FormState, 'previousState'>,
  errors?: { [field: string]: string },
}

export interface FieldState extends CommonState {
  disabled: boolean,
  initialValue: any,
  value: any,
  previousState: Omit<FieldState, 'previousState'>,
  error?: string,
  data?: any,
  errors?: { [validator: string]: string },
}

export type FormSubscriptionOptions = {
  [P in keyof Partial<Omit<FormState, 'previousState'>>]: boolean
}

export type FieldSubscriptionOptions = {
  [P in keyof Partial<Omit<FieldState, 'previousState'>>]: boolean
};

export type FieldSubscriptionCallback = (field: Input) => void;

export type FormSubscriptionCallback = (formState: FormState) => void;

export interface FieldSubscription {
  options: FieldSubscriptionOptions,
  callback: FieldSubscriptionCallback
}

export interface FormSubscription {
  options: FormSubscriptionOptions,
  callback: FormSubscriptionCallback
}

export interface InputHandlers {
  onChange(value: any): void,
  onBlur(): void,
  onFocus(): void
}

export interface FieldMeta extends Omit<FieldState, 'value' | 'previousState'> { }

export interface Input extends InputHandlers {
  meta: FieldMeta,
  disabled: boolean,
  value: any
}

export interface FieldValidator {
  name: string,
  params?: []
}

export type ValidatorFunction = (fieldState: FieldState, formValues: any, params: any) => string | Promise<string>;

export interface ValidatorSource {
  [name: string]: ValidatorFunction,
}

