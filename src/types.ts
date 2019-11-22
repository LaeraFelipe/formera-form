export interface State<T> {
  active: boolean,
  touched: boolean,
  pristine: boolean,
  dirty: boolean,
  valid: boolean,
  validating: boolean,
  disabled: boolean,
  submitting: boolean,
  previousState: Omit<T, 'previousState'>,
}

export interface FormState extends State<FormState> {
  initialValues: any,
  values: any,
  errors?: { [field: string]: string },
}

export interface FieldState extends State<FieldState> {
  initial: any,
  value: any,
  error?: string,
  data?: any,
  errors?: { [validator: string]: string },
}

export interface InternalState {
  options: FormOptions,
  formState: FormState,
  fieldStates: { [field: string]: FieldState },
  fieldEntries: { [field: string]: FieldEntrie },
  fieldSubscriptions: { [field: string]: FieldSubscription[] },
  formSubscriptions: FormSubscription[],
  validators: ValidationFunctionSource
}

export interface FormOptions {
  initialValues: any,
  onSubmit: (values: any) => any,
  customValidators?: ValidationFunctionSource,
  customValidationMessages?: ValidationMessageSource,
  validationType?: 'onChange' | 'onBlur',
  debug?: boolean
}

export interface FieldRegisterOptions {
  validationType?: 'onChange' | 'onBlur',
  validators?: Array<string | FieldValidator>,
  stopValidationOnFirstError?: boolean,
}

export interface FieldEntrie extends FieldRegisterOptions {
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
  name: string,
  meta: FieldMeta,
  disabled: boolean,
  value: any
}

export interface FieldValidator {
  name: string,
  params?: []
}

export type ValidatorFunction = (fieldState: FieldState, formValues: any, params?: any) => string | Promise<string>;

export interface ValidationFunctionSource {
  [name: string]: ValidatorFunction,
}

export interface ValidationMessageSource {
  [name: string]: string,
}

