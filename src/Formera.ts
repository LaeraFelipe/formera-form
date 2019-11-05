import * as fieldValidators from './validation/validators'
import * as formUtils from './utils/form-utils';
import * as fieldUtils from './utils/field-utils';
import { FormState, FormOptions, FieldSubscriptionOptions, FormSubscriptionCallback, FieldSubscriptionCallback, FormSubscriptionOptions, FieldEntries, FieldRegisterOptions, ValidatorSource, Input, FieldState, FieldSubscription, FormSubscription } from "./types";
import { defaultFormState, defaultFieldState, defaultFieldSubscriptionOptions, defaultFormSubscriptionOptions, defaultFieldRegisterOptions, defaultFormOptions } from "./default-values";
import { getChangeValue, getStateChanges } from "./utils";
import { cloneDeep } from 'lodash';

/**Timer identifier to log. */
const EXECUTION_TIMER_IDENTIFIER = '[FORMERA] EXECUTION TIME: ';

export default class Formera {
  /**Form options. */
  public options: FormOptions;

  /**Registered fields. */
  private fieldEntries: FieldEntries;

  /**Form state. */
  private state: FormState;

  /**Field states. */
  private fieldStates: { [field: string]: FieldState };

  /**Subscriptions to fields. */
  private fieldSubscriptions: { [field: string]: FieldSubscription[] };

  /**Subscriptions to form. */
  private formSubscriptions: FormSubscription[];

  /**Validators. */
  private validators: ValidatorSource;

  /**Initialize a form with options. */
  constructor(options: FormOptions) {
    this.options = { ...defaultFormOptions, ...options };

    this.initDebug('INIT');

    this.validators = { ...fieldValidators, ...options.customValidators }

    this.fieldEntries = {};

    this.state = {
      ...defaultFormState,
      initialValues: cloneDeep(options.initialValues),
      values: cloneDeep(options.initialValues),
    };

    this.state.previousState = formUtils.cloneState(this.state);

    this.fieldStates = {};

    this.fieldSubscriptions = {};

    this.formSubscriptions = [];

    this.change = this.change.bind(this);
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);
    this.registerField = this.registerField.bind(this);
    this.unregisterField = this.unregisterField.bind(this);
    this.fieldSubscribe = this.fieldSubscribe.bind(this);
    this.formSubscribe = this.formSubscribe.bind(this);

    this.endDebug();
  }

  /**Register the field. */
  public registerField(name: string, options?: FieldRegisterOptions): Input {
    this.initDebug('REGISTER', name);

    options = {
      ...defaultFieldRegisterOptions,
      validationType: this.options.validationType,
      ...options
    };

    this.fieldEntries[name] = { options };

    this.fieldStates[name] = {
      ...defaultFieldState,
      initialValue: fieldUtils.getFieldValue(name, this.state.initialValues),
      value: fieldUtils.getFieldValue(name, this.state.initialValues) || ''
    }

    this.fieldSubscriptions[name] = [];

    this.fieldEntries[name].handler = {
      onChange: (value: any) => this.change(name, value),
      onBlur: () => this.blur(name),
      onFocus: () => this.focus(name)
    }

    this.log('FIELD ENTRIE', this.fieldEntries[name]);
    this.log('FIELD STATE', this.fieldStates[name]);

    this.endDebug();

    return this.getField(name);
  }

  /**Unregister the field. */
  public unregisterField(name: string) {
    delete this.fieldEntries[name];
    delete this.fieldStates[name]
    delete this.fieldSubscriptions[name]
  }

  /**Do the focus actions in a field state. */
  public focus(field: string): void {
    this.initDebug('FOCUS', field);

    let fieldState = this.fieldStates[field];

    fieldUtils.setState(fieldState, { active: true });
    formUtils.setState(this.state, { active: true });

    this.endDebug();

    this.notifySubscribers(field);
  }

  /**Do the change actions in a field state. */
  public change(field: string, incommingValue: any): void {
    this.initDebug('CHANGE', field);

    const value = getChangeValue(incommingValue);

    const fieldEntrie = this.fieldEntries[field];
    let fieldState = this.fieldStates[field];

    fieldUtils.setState(fieldState, {
      value,
      pristine: fieldUtils.isEqual(fieldState.initialValue, value)
    });

    formUtils.setState(this.state, {
      [`values.${field}`]: value,
      pristine: !fieldState.pristine ? fieldState.pristine : formUtils.isPristine(this.fieldStates)
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

    fieldUtils.setState(fieldState, {
      active: false,
      touched: true,
      dirty: !fieldState.pristine
    });

    formUtils.setState(this.state, {
      active: true,
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
  public async validateField(field: string, notifySubscribers: boolean = true): Promise<void> {
    const { validators, stopValidationOnFirstError } = this.fieldEntries[field].options;

    this.log('VALIDATORS', validators)

    if (validators && validators.length) {
      const fieldState = this.fieldStates[field];

      fieldUtils.setState(fieldState, { validating: true });
      formUtils.setState(this.state, { validating: true });

      if (notifySubscribers) this.notifySubscribers(field);

      let error: string, errors = {};

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
            const currenteError = await this.validators[validatorName](fieldState, this.state.values, validatorParams);

            errors[validator] = currenteError;

            if (!error) {
              error = currenteError;
              if (stopValidationOnFirstError) break;
            }

          }
        } catch (error) {
          this.log('VALIDATION ERROR', error);
        }
      }

      fieldUtils.setState(fieldState, { validating: false, valid: !error, errors });
      formUtils.setState(this.state, {
        validating: false,
        valid: error ? false : formUtils.isValid(this.fieldStates),
        [`errors.${field}`]: { ...errors }
      }
      );

      if (notifySubscribers) this.notifySubscribers(field);
    }
  }

  /**Submmit the form. */
  public async submit() {
    const { onSubmit } = this.options;

    formUtils.setState(this.state, { submitting: true });

    this.notifySubscribers();

    await onSubmit(this.state.values);

    formUtils.setState(this.state, { submitting: false });

    this.notifySubscribers();
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
  private getField(field: string): Input {
    const fieldState = this.fieldStates[field];
    const fieldHandler = this.fieldEntries[field].handler;
    return {
      ...fieldHandler,
      value: fieldState.value,
      disabled: fieldState.disabled,
      meta: {
        active: fieldState.active,
        touched: fieldState.touched,
        pristine: fieldState.pristine,
        dirty: fieldState.dirty,
        valid: fieldState.valid,
        validating: fieldState.validating,
        error: fieldState.error,
        errors: fieldState.errors,
        submitting: fieldState.submitting,
        disabled: fieldState.disabled,
        data: fieldState.data,
        initialValue: fieldState.initialValue,
      }
    }
  }

  /**Log messages. */
  private log(...logs: any): void {
    if (this.options.debug) console.log('[FORMERA]', ...logs);
  }

  /**Init the debug log with timer. */
  private initDebug(action: string, field?: string): void {
    if (this.options.debug) {
      let identifier: string;
      identifier = `[FORMERA] ACTION: "${action}"`;
      if (field) identifier = identifier.concat(` FIELD: "${field}"`);
      console.groupCollapsed(identifier);
      console.time(EXECUTION_TIMER_IDENTIFIER);
    }
  }

  /**End the debug log. */
  private endDebug(): void {
    if (this.options.debug) {
      console.timeEnd(EXECUTION_TIMER_IDENTIFIER);
      console.groupEnd();
    }
  }

}
