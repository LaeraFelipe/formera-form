import Formera from ".";

/**Common state between field and form.*/
export interface State<T> {
  /**Whether the form or field is active. */
  active: boolean,
  /**If the form or field has already had focus and blur. */
  touched: boolean,
  /**Whether the value of the field or form is equal to the initial value. */
  pristine: boolean,
  /**Whether the value of the field or form is different from the initial value. */
  dirty: boolean,
  /**Whether the value of the field or form is valid. */
  valid: boolean,
  /**Whether the field or form is in the process of validation. */
  validating: boolean,
  /**Whether the field or form is disabled. */
  disabled: boolean,
  /**Whether the field or form is being submitted. */
  submitting: boolean,
  /**Previous state of the field or form. */
  previousState: Omit<T, 'previousState'>,
}

/**Form state. */
export interface FormState extends State<FormState> {
  /**Initial values. */
  initialValues: any,
  /**Current values. */
  values: any,
  /**Form errors grouped by field.  */
  errors?: { [field: string]: string },
}

/**Field State. */
export interface FieldState extends State<FieldState> {
  /**Initial value. */
  initial: any,
  /**Current value.*/
  value: any,
  /**Random data. */
  data?: any,
  /**First field error. */
  error?: string,
  /**Errors grouped by the names of the validator functions. */
  errors?: { [validator: string]: string },
}

/**Internal state of the form. */
export interface InternalState {
  /**Form design options.*/
  options: FormOptions,
  /**Form state. */
  formState: FormState,
  /**Field states. */
  fieldStates: { [field: string]: FieldState },
  /**Field entries. */
  fieldEntries: { [field: string]: FieldEntry },
  /**Field subscriptions; */
  fieldSubscriptions: { [field: string]: { index: number, subscriptions: { [key: string]: FieldSubscription } } },
  /**Form subscriptions. */
  formSubscriptions: FormSubscription[],
  /**Validator functions. */
  validators: ValidationFunctionSource
}

/**Form design options. */
export interface FormOptions {
  /**Initial values. */
  initialValues: any,
  /**Submit callback.
   * @param values Current form values.
   */
  onSubmit: (formState: FormState) => any,
  /**Validator functions for use by fields. */
  customValidators?: ValidationFunctionSource,
  /**Validation messages for use by standard validators. */
  customValidationMessages?: ValidationMessageSource,
  /**If values must be valid to submit. */
  allowInvalidSubmit?: boolean,
  /**Validation type. */
  validationType?: 'onChange' | 'onBlur',
  /**If the form is in debug mode. If true each form action will log information. */
  debug?: boolean
}

/**Field registration options. */
export interface FieldRegisterOptions {
  /**Validation type. If there is no value use the value entered in the form options.*/
  validationType?: 'onChange' | 'onBlur',
  /**Validators used in the field. Must be between the default validators or validators entered in the "customValidators" property. */
  validators?: Array<string | FieldValidator>,
  /**Whether validation should stop at the first error. */
  stopValidationOnFirstError?: boolean,
}

/**Field entry. */
export interface FieldEntry extends FieldRegisterOptions {
  /**Entries count. */
  entries: number,
  /**Function group used to change and subscribe to field-related values.*/
  handler?: FieldHandler,
  /**Field validator debounce references. */
  debounceRefs?: { [key: string]: any }
}

/**Field entries by field name. */
export type FieldEntries = {
  /**Field entry*/
  [field: string]: FieldEntry
}

/**Form subscription options. */
export type FormSubscriptionOptions = {
  [P in keyof Partial<Omit<FormState, 'previousState'>>]: boolean
}

/**Field subscription options. */
export type FieldSubscriptionOptions = {
  [P in keyof Partial<Omit<FieldState, 'previousState'>>]: boolean
};

/**Field subscription callback. This is invoked whenever a change is made to the field state unless the state part is ignored in the field subscription options. */
export type FieldSubscriptionCallback = (field: FieldState) => void;

/**Form subscription callback. This is invoked whenever a change is made to the state form unless the state part is ignored in the form subscription options. */
export type FormSubscriptionCallback = (formState: FormState) => void;

/**Field subscription. */
export interface FieldSubscription {
  /**Parts of the field state that should be listened to. */
  options: FieldSubscriptionOptions,
  /**Field subscription callback. */
  callback: FieldSubscriptionCallback
}

/**Form subscription. */
export interface FormSubscription {
  /**Parts of the form state that should be listened to. */
  options: FormSubscriptionOptions,
  /**Form subscription callback. */
  callback: FormSubscriptionCallback
}

/**Function group used to change and subscribe to field-related values. */
export interface FieldHandler {
  /**
   * Do the field subscription.
   * @param callback Callback to be invoked when field state changes.
   * @param options Parts of the form state that should be listened to.
   */
  subscribe(callback: FieldSubscriptionCallback, options?: FieldSubscriptionOptions): void,
  /**Function to be called for the field value to change.  */
  onChange(value: any): void,
  /**Function to be called when the field loses focus.  */
  onBlur(): void,
  /**Function to be called when the field gains focus. */
  onFocus(): void,
  /**Function to be called to enable field.  */
  enable(): void,
  /**Function to be called to disable field.  */
  disable(): void,
  /**Function to be called to set random data to the field. */
  setData(dataName: string, value: any): void
}

/**Field validator. */
export interface FieldValidator {
  /**Name of the validator function. */
  name: string,
  /**Debounce time. */
  debounce?: number,
  /**Params to the validator function. */
  params?: any[],
  /**Custom function. */
  func?: ValidatorFunction
}

/**
 * Validator function.
 * @param fieldState Current field state.
 * @param formValuies Current form values.
 * @param params Parameters entered.
 */
export type ValidatorFunction = (fieldState: FieldState, formera: Formera, ...params: Array<any>) => string | Promise<string>;

/**Source of validator functions. */
export interface ValidationFunctionSource {
  /**Validator function. */
  [name: string]: ValidatorFunction,
}

/**Source of validation messages. */
export interface ValidationMessageSource {
  /**Validator message. */
  [name: string]: string,
}

