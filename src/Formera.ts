import * as fieldValidators from './validation/fieldValidators'
import { FormState, FormOptions, FieldHandler, FieldStates, FieldSubscriptionOptions, FormSubscriptionCallback, FieldSubscriptions, FormSubscriptions, FieldSubscriptionCallback, FormSubscriptionOptions, FieldEntries, FieldRegisterOptions, ValidatorSource, Field } from "./types";
import { cloneDeep } from 'lodash';
import { defaultFormState, defaultFieldState, defaultFieldSubscriptionOptions, defaultFormSubscriptionOptions, defaultFieldRegisterOptions } from "./defaultValues";
import { getFieldValueFromSource, getChangeValue, getStateChanges, isFieldValueEqual, setState } from "./utils";

/**Timer identifier to log. */
const EXECUTION_TIMER_IDENTIFIER = '[FORMERA] EXECUTION TIME: ';

export default class Form {
  /**Indicates if the form is in debug mode. */
  private debug: boolean = false;

  /**Registered fields. */
  private fieldEntries: FieldEntries;

  /**Form state. */
  private state: FormState;

  /**Field states. */
  private fieldStates: FieldStates;

  /**Subscriptions to fields. */
  private fieldSubscriptions: FieldSubscriptions;

  /**Subscriptions to form. */
  private formSubscriptions: FormSubscriptions;

  /**Validators. */
  private fieldValidators: ValidatorSource;

  private handleSubmit: (values: any) => any;

  /**Initialize a form with options. */
  constructor(options: FormOptions) {
    this.debug = !!options.debug;

    this.initDebug('INIT');

    this.fieldValidators = { ...fieldValidators, ...options.customValidators }

    this.handleSubmit = options.onSubmit;

    this.fieldEntries = {};

    this.state = {
      ...defaultFormState,
      initialValues: cloneDeep(options.initialValues),
      values: cloneDeep(options.initialValues),
    };

    this.state.previousState = cloneDeep(this.state) as any;

    this.fieldStates = {};

    this.fieldSubscriptions = {};

    this.formSubscriptions = [];

    this.change = this.change.bind(this);
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);

    this.endDebug();
  }

  /**Register the field. */
  public registerField(name: string, options?: FieldRegisterOptions): Field {
    this.initDebug('REGISTER', name);

    options = { ...defaultFieldRegisterOptions, ...options };

    this.fieldEntries[name] = { options };

    this.fieldStates[name] = {
      ...defaultFieldState,
      initialValue: getFieldValueFromSource(name, this.state.initialValues),
      value: getFieldValueFromSource(name, this.state.initialValues) || ''
    }

    this.fieldSubscriptions[name] = [];

    this.fieldEntries[name].handler = {
      onChange: (value: any) => this.change(name, value),
      onBlur: () => this.blur(name),
      onFocus: () => this.focus(name),
      subscribe: (
        callback: FieldSubscriptionCallback,
        options: FieldSubscriptionOptions = { ...defaultFieldSubscriptionOptions }
      ) => this.fieldSubscribe(name, callback, options)
    }

    this.endDebug();

    return this.getField(name);
  }

  /**Unregister the field. */
  public unregisterField(name: string) {
    delete this.fieldEntries[name];
    this.fieldStates[name] = null;
    this.fieldSubscriptions[name] = null;
  }

  /**Do the focus actions in a field state. */
  public focus(field: string): void {
    this.initDebug('FOCUS', field);

    let fieldState = this.fieldStates[field];

    setState(fieldState, { active: true });

    this.endDebug();

    this.notifySubscribers(field);
  }

  /**Do the change actions in a field state. */
  public change(field: string, incommingValue: any): void {
    this.initDebug('CHANGE', field);

    const value = getChangeValue(incommingValue);

    const fieldEntrie = this.fieldEntries[field];
    let fieldState = this.fieldStates[field];

    setState(fieldState, {
      value,
      pristine: isFieldValueEqual(fieldState.initialValue, value)
    });

    setState(this.state, {
      [`values.${field}`]: value,
      pristine: !fieldState.pristine ? fieldState.pristine : this.calcFormPristine()
    })

    this.endDebug();

    this.notifySubscribers(field);

    if (fieldEntrie.options.validationType === 'onChange') {
      this.validateField(field);
    }
  }

  /**Do the blur actions in a field state. */
  public blur(field: string): void {
    this.initDebug('BLUR', field);

    const fieldEntrie = this.fieldEntries[field];
    let fieldState = this.fieldStates[field];

    setState(fieldState, {
      active: false,
      touched: true,
      dirty: !fieldState.pristine
    });

    setState(this.state, {
      touched: true,
      dirty: !this.state.pristine
    })

    this.log('FIELDSTATE', fieldState);

    this.endDebug();

    this.notifySubscribers(field);

    if (fieldEntrie.options.validationType === 'onBlur') {
      this.validateField(field);
    }
  }

  /**Do the field validation. */
  public async validateField(field: string): Promise<void> {
    const { validators } = this.fieldEntries[field].options;

    if (validators && validators.length) {
      const fieldState = this.fieldStates[field];

      setState(fieldState, { validating: true });
      setState(this.state, { validating: true });

      this.notifySubscribers(field);

      let error: string;

      for (const validator of validators) {
        let validatorName: string, validatorParams = [];

        if (typeof validator === "string") {
          validatorName = validator;
        } else {
          validatorName = validator.name;
          validatorParams = validator.params || [];
        }

        try {
          if (typeof validator === 'string') {
            error = await this.fieldValidators[validatorName](fieldState, this.state.values, validatorParams);
            if (error) break;
          }
        } catch (error) {
          this.log('VALIDATION ERROR', error);
        }
      }

      setState(fieldState, { validating: false, valid: !error, error });
      setState(this.state, {
        validating: false,
        valid: error ? false : this.calcFormValid(),
        [`errors.${field}`]: error
      }
      );

      this.notifySubscribers(field);
    }
  }

  /**Submmit the form. */
  public async submit() {
    setState(this.state, { submitting: true });
    await this.handleSubmit(this.state.values);
    setState(this.state, { submitting: false });
  }

  /**Subscribe to field. */
  public fieldSubscribe(field: string, callback: FieldSubscriptionCallback, options: FieldSubscriptionOptions = { ...defaultFieldSubscriptionOptions }): void {
    this.fieldSubscriptions[field].push({ callback, options })
  }

  /**Subscribe to form. */
  public formSubscribe(callback: FormSubscriptionCallback, options: FormSubscriptionOptions = { ...defaultFormSubscriptionOptions }): void {
    this.formSubscriptions.push({ callback, options });
  }

  /**Notify all subscribers. */
  private notifySubscribers(field?: string) {
    if (field) {
      const fieldState = this.fieldStates[field];
      const fieldStateChanges = getStateChanges(fieldState);

      this.log('FIELD CHANGES: ', fieldStateChanges);

      for (const fieldSubscription of this.fieldSubscriptions[field]) {
        if (fieldStateChanges.some(change => fieldSubscription.options[change])) {
          fieldSubscription.callback(this.getField(field));
        }
      }
    }

    const formStateChanges = getStateChanges(this.state);

    this.log('FORM CHANGES: ', formStateChanges);

    for (const formSubscription of this.formSubscriptions) {
      if (formStateChanges.some(change => formSubscription.options[change])) {
        formSubscription.callback(this.state);
      }
    }
  }

  /**Return form state. */
  public getState() {
    return this.state;
  }

  /**Returns a field to manipulate and extract data. */
  private getField(field: string): Field {
    const fieldState = this.fieldStates[field];
    const fieldHandler = this.fieldEntries[field].handler;
    return {
      ...fieldHandler,
      value: fieldState.value,
      disabled: fieldState.disabled,
      meta: {
        active: fieldState.active,
        data: fieldState.data,
        dirty: fieldState.dirty,
        error: fieldState.error,
        initialValue: fieldState.initialValue,
        pristine: fieldState.pristine,
        touched: fieldState.touched,
        valid: fieldState.valid,
        validating: fieldState.validating
      }
    }
  }

  /**Calculate if the form is pristine. */
  private calcFormPristine() {
    for (const key in this.fieldStates) {
      if (!this.fieldStates[key].pristine) return false;
    }
    return true;
  }

  /**Calculate if the form is valid. */
  private calcFormValid() {
    for (const key in this.fieldStates) {
      if (!this.fieldStates[key].valid) return false;
    }
    return true;
  }

  /**Log messages. */
  private log(...logs: any): void {
    if (this.debug) console.log('[FORMERA]', ...logs);
  }

  /**Init the debug log with timer. */
  private initDebug(action: string, field?: string): void {
    if (this.debug) {
      let identifier: string;
      identifier = `[FORMERA] ACTION: "${action}"`;
      if (field) identifier = identifier.concat(` FIELD: "${field}"`);
      console.groupCollapsed(identifier);
      console.time(EXECUTION_TIMER_IDENTIFIER);
    }
  }

  /**End the debug log. */
  private endDebug(): void {
    if (this.debug) {
      console.timeEnd(EXECUTION_TIMER_IDENTIFIER);
      console.groupEnd();
    }
  }

}
