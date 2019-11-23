import initializeValidators from './validation';
import { defaultFormState, defaultFieldState, defaultFieldSubscriptionOptions, defaultFormSubscriptionOptions, defaultFieldRegisterOptions, defaultFormOptions } from "./defaultValues";
import { getChangedValue, clone, cloneState, get, setState, isEqual, merge } from "./utils";
import { FormState, FormOptions, FieldSubscriptionOptions, FormSubscriptionCallback, FieldSubscriptionCallback, FormSubscriptionOptions, FieldRegisterOptions, FieldState, InternalState, FieldHandler } from "./types";

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
  public registerField(name: string, options: FieldRegisterOptions = {}): FieldHandler {
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
      subscribe: (callback: FieldSubscriptionCallback) => this.fieldSubscribe(name, callback),
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

    return this.state.fieldEntries[name].handler;
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
  public change(field: string, value: any): void {
    this.initDebug('CHANGE', field);

    const { fieldEntries, fieldStates, formState } = this.state;

    const fieldEntrie = fieldEntries[field];
    let fieldState = fieldStates[field];

    const previousValue = get(formState.previousState.values, field);

    const valueChanged = isEqual(previousValue, value);

    let fieldChanges = setState<FieldState>(fieldState, { pristine: valueChanged });

    if (valueChanged) fieldChanges.push('value');

    const formChanges = setState<FormState>(formState, {
      [`values.${field}`]: value,
      pristine: !fieldState.pristine ? fieldState.pristine : isEqual(formState.initialValues, formState.values)
    });

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
            const currentError =
              await validatorsFunctions[validatorName](this.getFieldState(field), formState.values, validatorParams);

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
      });

      if (notifySubscribers) this.notifySubscribers(formChanges, field, fieldChanges);
    }
  }

  /**Submmit the form. */
  public async submit() {
    const { options, formState, fieldStates } = this.state;
    const { onSubmit } = options;

    //Validating and setting all fields touched.
    for (const field in fieldStates) {
      await this.validateField(field, false);
      setState<FieldState>(fieldStates[field], { touched: true });
    }

    if (!formState.valid) {
      this.notifyAllSubscribers();
      return;
    }

    setState<FormState>(formState, { submitting: true });

    this.notifyAllSubscribers();

    await onSubmit(formState.values);

    setState<FormState>(formState, { submitting: false });

    this.notifyAllSubscribers();
  }

  /**Subscribe to field. */
  public fieldSubscribe(field: string, callback: FieldSubscriptionCallback, options: FieldSubscriptionOptions = { ...defaultFieldSubscriptionOptions }): void {
    this.state.fieldSubscriptions[field].push({ callback, options })
  }

  /**Subscribe to form. */
  public formSubscribe(callback: FormSubscriptionCallback, options: FormSubscriptionOptions = { ...defaultFormSubscriptionOptions }): void {
    this.state.formSubscriptions.push({ callback, options });
  }

  /**Return the builded field state with current and initial value. */
  public getFieldState(field: string): FieldState {
    const { fieldStates, formState } = this.state;

    const fieldState = fieldStates[field];

    const value = get(formState.values, field) || '';
    const initial = get(formState.values, field) || '';

    const { submitting } = formState;

    return { ...fieldState, value, initial, submitting };
  }

  /**Return form state. */
  public getState() {
    return this.state.formState;
  }

  /**Notify all subscribers. */
  private notifySubscribers(formChanges: string[], field?: string, fieldChanges?: string[]) {
    const { fieldSubscriptions, formState, formSubscriptions, fieldEntries } = this.state;

    if (field) {
      this.log('FIELD CHANGES: ', fieldChanges);

      for (const fieldSubscription of fieldSubscriptions[field]) {
        if (fieldChanges.some(change => fieldSubscription.options[change])) {
          fieldSubscription.callback(this.getFieldState(field));
        }
      }

      //Notifying nested fields.
      for (const nestedField in fieldEntries) {
        if (nestedField.startsWith(field)) {
          const nestedFieldSubscriptions = fieldSubscriptions[nestedField];
          nestedFieldSubscriptions
            .forEach(subscription => subscription.callback(this.getFieldState(nestedField)));
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

  /**Notify all subscribes of all fields. */
  private notifyAllSubscribers() {
    const { fieldEntries, formState, formSubscriptions, fieldSubscriptions } = this.state;

    //Notifying form subscribers.
    formSubscriptions.forEach(subscription => subscription.callback(formState));

    //Notifying field subscribers.
    for (const field in fieldEntries) {
      fieldSubscriptions[field]
        .forEach(subscription => subscription.callback(this.getFieldState(field)));
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
