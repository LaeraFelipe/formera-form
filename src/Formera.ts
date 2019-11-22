import initializeValidators from './validation';
import { defaultFormState, defaultFieldState, defaultFieldSubscriptionOptions, defaultFormSubscriptionOptions, defaultFieldRegisterOptions, defaultFormOptions } from "./defaultValues";
import { getChangedValue, clone, cloneState, get, setState, isEqual, merge } from "./utils";
import { FormState, FormOptions, FieldSubscriptionOptions, FormSubscriptionCallback, FieldSubscriptionCallback, FormSubscriptionOptions, FieldRegisterOptions, Input, FieldState, InternalState } from "./types";

/**Timer identifier to log. */
const EXECUTION_TIMER_IDENTIFIER = '[FORMERA] EXECUTION TIME: ';

export default class Formera {
  /**Internal form state. */
  private state: InternalState;

  /**Return if a form is in debug mode. */
  get debug() {
    return this.state.options.debug
  }

  /**Initialize a form. */
  constructor(options: FormOptions) {
    this.state = {} as InternalState;

    this.state.options = merge(defaultFormOptions, options);

    this.initDebug('INIT');

    this.log('FORM OPTIONS', this.state.options);

    const { customValidators, customValidationMessages } = this.state.options;

    this.state.validators = initializeValidators(customValidators, customValidationMessages);

    this.state.fieldEntries = {};

    this.state.formState = {
      ...defaultFormState,
      initialValues: clone(options.initialValues),
      values: clone(options.initialValues),
    };

    this.state.formState.previousState = cloneState(this.state.formState);

    this.state.fieldStates = {};

    this.state.fieldSubscriptions = {};

    this.state.formSubscriptions = [];

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
  public registerField(name: string, options: FieldRegisterOptions = {}): Input {
    this.initDebug('REGISTER', name);

    const { formState, options: formOptions } = this.state;

    this.log('FIELD OPTIONS', options);

    this.state.fieldEntries[name] = {
      ...defaultFieldRegisterOptions,
      ...options,
      validationType: options.validationType || formOptions.validationType,
      stopValidationOnFirstError: options.stopValidationOnFirstError || defaultFieldRegisterOptions.stopValidationOnFirstError
    };

    this.state.fieldStates[name] = {
      ...defaultFieldState,
      initial: clone(get(formState.values, name)),
      value: clone(get(formState.values, name)) || ''
    }

    this.state.fieldStates[name].previousState = clone(this.state.fieldStates[name]);

    this.state.fieldSubscriptions[name] = [];

    this.state.fieldEntries[name].handler = {
      onChange: (value: any) => this.change(name, value),
      onBlur: () => this.blur(name),
      onFocus: () => this.focus(name)
    }

    //Doing the first validation in field.
    if (options.validators && options.validators.length) {
      this.validateField(name);
    }

    this.log('FIELD ENTRIE', this.state.fieldEntries[name]);
    this.log('FIELD STATE', this.state.fieldStates[name]);

    this.endDebug();

    return this.getInput(name);
  }

  /**Unregister the field. */
  public unregisterField(name: string) {
    delete this.state.fieldEntries[name];
    delete this.state.fieldStates[name]
    delete this.state.fieldSubscriptions[name]
  }

  /**Do the focus actions in a field state. */
  public focus(field: string): void {
    this.initDebug('FOCUS', field);

    let { formState, fieldStates } = this.state;
    let fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, { active: true });
    const formChanges = setState<FormState>(formState, { active: true });

    this.endDebug();

    this.notifySubscribers(formChanges, field, fieldChanges);
  }

  /**Do the change actions in a field state. */
  public change(field: string, incommingValue: any): void {
    this.initDebug('CHANGE', field);

    const { fieldEntries, fieldStates, formState } = this.state;

    const value = getChangedValue(incommingValue);

    const fieldEntrie = fieldEntries[field];
    let fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, {
      value: value,
      pristine: isEqual(fieldState.initial, value)
    });

    const formChanges = setState<FormState>(formState, {
      [`values.${field}`]: value,
      pristine: !fieldState.pristine ? fieldState.pristine : isEqual(formState.initialValues, formState.values)
    })

    this.endDebug();

    this.notifySubscribers(formChanges, field, fieldChanges);

    if (fieldEntrie.validationType === 'onChange') {
      this.validateField(field);
    }
  }

  /**Do the blur actions in a field state. */
  public blur(field: string): void {
    this.initDebug('BLUR', field);

    const { fieldEntries, fieldStates, formState } = this.state;

    const fieldEntrie = fieldEntries[field];
    let fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, {
      active: false,
      touched: true,
      dirty: !fieldState.pristine
    });

    const formChanges = setState<FormState>(formState, {
      active: true,
      touched: true,
      dirty: !formState.pristine
    })

    this.log('FIELDSTATE', fieldState);

    this.endDebug();

    this.notifySubscribers(formChanges, field, fieldChanges);

    if (fieldEntrie.validationType === 'onBlur') {
      this.validateField(field);
    }
  }

  /**Do the field validation. */
  public async validateField(field: string, notifySubscribers: boolean = true): Promise<void> {
    const { fieldEntries, fieldStates, formState, validators: validatorsFunctions } = this.state;

    const { validators, stopValidationOnFirstError } = fieldEntries[field];

    this.log('VALIDATORS', validators)

    if (validators && validators.length) {
      const fieldState = fieldStates[field];

      const fieldChanges = setState<FieldState>(fieldState, { validating: true });
      const formChanges = setState<FormState>(formState, { validating: true });

      if (notifySubscribers) this.notifySubscribers(formChanges, field, fieldChanges);

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
            const currentError = await validatorsFunctions[validatorName](fieldState, formState.values, validatorParams);

            errors[validator] = currentError;

            if (!error) {
              error = currentError;
              if (stopValidationOnFirstError) break;
            }

          }
        } catch (error) {
          this.log('VALIDATION ERROR', error);
        }
      }

      setState<FieldState>(fieldState, { validating: false, valid: !error, errors, error });

      setState<FormState>(formState, {
        validating: false,
        valid: error ? false : !Object.keys(fieldStates).some(key => !fieldStates[key].valid),
        [`errors.${field}`]: { ...errors }
      }
      );

      if (notifySubscribers) this.notifySubscribers(formChanges, field, fieldChanges);
    }
  }

  /**Return the builded field state. */
  public getFieldState(field: string): FieldState {
    const { fieldStates, formState } = this.state;

    const fieldState = fieldStates[name];

    const value = get(field, formState.values) || '';
    const initial = get(field, formState.values) || '';

    const { submitting } = formState;

    return { ...fieldState, value, initial, submitting };
  }

  /**Submmit the form. */
  public async submit() {
    const { options, formState } = this.state;

    const { onSubmit } = this.state.options;

    const formChanges = setState<FormState>(formState, { submitting: true });

    this.notifySubscribers(formChanges);

    await onSubmit(formState.values);

    const afterformChanges = setState<FormState>(formState, { submitting: false });

    this.notifySubscribers(afterformChanges);
  }

  /**Subscribe to field. */
  public fieldSubscribe(field: string, callback: FieldSubscriptionCallback, options: FieldSubscriptionOptions = { ...defaultFieldSubscriptionOptions }): void {
    this.state.fieldSubscriptions[field].push({ callback, options })
  }

  /**Subscribe to form. */
  public formSubscribe(callback: FormSubscriptionCallback, options: FormSubscriptionOptions = { ...defaultFormSubscriptionOptions }): void {
    this.state.formSubscriptions.push({ callback, options });
  }

  /**Notify all subscribers. */
  private notifySubscribers(formChanges: string[], field?: string, fieldChanges?: string[]) {
    const { fieldStates, fieldSubscriptions, formState, formSubscriptions } = this.state;

    if (field) {
      this.log('FIELD CHANGES: ', fieldChanges);

      for (const fieldSubscription of fieldSubscriptions[field]) {
        if (fieldChanges.some(change => fieldSubscription.options[change])) {
          fieldSubscription.callback(this.getInput(field));
        }
      }
    }

    this.log('FORM CHANGES: ', formChanges);

    for (const formSubscription of formSubscriptions) {
      if (formChanges.some(change => formSubscription.options[change])) {
        formSubscription.callback(formState);
      }
    }
  }

  /**Return form state. */
  public getState() {
    return this.state;
  }

  /**Returns a field to manipulate and extract data. */
  private getInput(field: string): Input {
    const { fieldEntries, fieldStates } = this.state;
    const fieldState = fieldStates[field];
    const fieldHandler = fieldEntries[field].handler;
    return {
      ...fieldHandler,
      name: field,
      value: fieldState.value,
      disabled: fieldState.disabled,
      meta: {
        submitting: fieldState.submitting,
        active: fieldState.active,
        touched: fieldState.touched,
        pristine: fieldState.pristine,
        dirty: fieldState.dirty,
        valid: fieldState.valid,
        validating: fieldState.validating,
        error: fieldState.error,
        errors: fieldState.errors,
        disabled: fieldState.disabled,
        data: fieldState.data,
        initial: fieldState.initial,
      }
    }
  }

  /**Log messages. */
  private log(...logs: any): void {
    const { options } = this.state;
    if (options.debug) console.log('[FORMERA]', ...logs);
  }

  /**Init the debug log with timer. */
  private initDebug(action: string, field?: string): void {
    const { options } = this.state;

    if (options.debug) {
      let identifier: string;
      identifier = `[FORMERA] ACTION: "${action}"`;
      if (field) identifier = identifier.concat(` FIELD: "${field}"`);
      console.groupCollapsed(identifier);
      console.time(EXECUTION_TIMER_IDENTIFIER);
    }
  }

  /**End the debug log. */
  private endDebug(): void {
    const { options } = this.state;
    if (options.debug) {
      console.timeEnd(EXECUTION_TIMER_IDENTIFIER);
      console.groupEnd();
    }
  }

}
