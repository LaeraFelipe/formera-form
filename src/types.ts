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
}

export interface FieldEntrie {
  options: FieldRegisterOptions,
  handler?: FieldHandler,
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
}

export interface FormSubscriptionOptions extends Partial<Omit<FormState, 'previousState'>> { };

export interface FieldSubscriptionOptions extends Partial<Omit<FieldState, 'previousState'>> { };

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

export interface FieldHandler {
  onChange(value: any): void,
  onBlur(): void,
  onFocus(): void,
  subscribe(callback: FieldSubscriptionCallback, options?: FieldSubscriptionOptions): void,
}

export interface FieldMeta extends Omit<FieldState, 'value' | 'previousState'> { }

export interface Input extends FieldHandler {
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