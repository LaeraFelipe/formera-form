import initializeValidators from './validation';
import { defaultFormState, defaultFieldState, defaultFieldSubscriptionOptions, defaultFormSubscriptionOptions, defaultFieldRegisterOptions, defaultFormOptions } from "./defaultValues";
import { getChangedValue, clone, cloneState, get, setState, isEqual, merge, isFieldChild } from "./utils";
import { FormState, FormOptions, FieldSubscriptionOptions, FormSubscriptionCallback, FieldSubscriptionCallback, FormSubscriptionOptions, FieldRegisterOptions, FieldState, InternalState, FieldHandler } from "./types";
import { getStateChanges } from './utils/state';

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

    this.focus = this.focus.bind(this);
    this.change = this.change.bind(this);
    this.blur = this.blur.bind(this);
    this.setFieldData = this.setFieldData.bind(this);
    this.disable = this.disable.bind(this);
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
      subscribe: (callback: FieldSubscriptionCallback, options?: FieldSubscriptionOptions) => this.fieldSubscribe(name, callback, options),
      onChange: (value: any) => this.change(name, value),
      onBlur: () => this.blur(name),
      onFocus: () => this.focus(name),
      disable: () => this.disable(name),
      setData: (dataName: string, value: any) => this.setFieldData(name, dataName, value)
    }

    //Doing the first validation in field.
    if (options.validators && options.validators.length) {
      this.validateField(name, false);
    }

    this.log('FIELD ENTRIE', this.state.fieldEntries[name]);
    this.log('FIELD STATE', this.state.fieldStates[name]);

    this.endDebug();

    return this.state.fieldEntries[name].handler;
  }

  /**Unregister the field. */
  public unregisterField(field: string) {
    delete this.state.fieldEntries[field];
    delete this.state.fieldStates[field]
    delete this.state.fieldSubscriptions[field]
  }

  /**Do the focus actions in a field state. */
  public focus(field: string): void {
    this.initDebug('FOCUS', field);

    if (field == null || field === '') {
      throw new Error('You should pass a field to focus.');
    }

    let { formState, fieldStates } = this.state;
    let fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, { active: true });
    const formChanges = setState<FormState>(formState, { active: true });

    this.endDebug();

    this.notifyFormSubscribers(formChanges);
    this.notifyFieldSubscribers(field, fieldChanges, false);
  }

  /**Do the change actions in a field state. */
  public change(field: string, value: any): void {
    this.initDebug('CHANGE', field);

    const { formState, fieldStates, fieldEntries } = this.state;

    const hasChilds = this.hasChild(field);

    const previousValue = get(formState.values, field);
    const valueChanged = !isEqual(previousValue, value);
    const isPristine = isEqual(get(formState.initialValues, field), value);

    //Getting the path to ser field value.
    const keyToSet = field ? `values.${field}` : 'values';

    //Changing formstate.
    const formChanges = setState<FormState>(
      formState,
      {
        [keyToSet]: value,
        pristine: !isPristine ? isPristine : isEqual(formState.initialValues, formState.values)
      }
    );

    this.notifyFormSubscribers(formChanges);

    //Validating and notifying all childs.
    if (hasChilds) {
      for (const nested in fieldEntries) {
        //Taking all fields including this one.
        if (isFieldChild(field, nested)) {
          //Updating pristine.
          const nestedFieldState = fieldStates[nested];

          const nestedValue = get(formState.values, nested);
          const nestedPreviousValue = get(formState.previousState.values, nested);
          const nestedInitialValue = get(formState.initialValues, nested);

          const isNestedPristine = isEqual(nestedValue, nestedInitialValue);
          const isNestedModified = !isEqual(nestedValue, nestedPreviousValue);

          let nestedFieldChanges = setState<FieldState>(nestedFieldState,
            {
              pristine: isNestedPristine
            }
          );

          if (isNestedModified) {
            nestedFieldChanges.push('value');
          }

          this.notifyFieldSubscribers(nested, nestedFieldChanges);

          //Forcing to validate all childs if your value change.
          if (isNestedModified) {
            this.validateField(nested);
          }
        }
      }
    }
    //Validating and notifying just current field.
    else if (field) {
      const fieldEntrie = fieldEntries[field];
      let fieldState = fieldStates[field];

      const fieldChanges = setState<FieldState>(fieldState, { pristine: isPristine });
      if (valueChanged) fieldChanges.push('value');

      if (fieldEntrie.validationType === "onChange") {
        this.validateField(field);
      };
      this.notifyFieldSubscribers(field, fieldChanges);
    }
    this.endDebug();
  }

  /**Do the blur actions in a field state. */
  public blur(field: string): void {
    this.initDebug('BLUR', field);

    if (field == null || field === '') {
      throw new Error('You should pass a field to blur.');
    }

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

    this.notifyFormSubscribers(formChanges);
    this.notifyFieldSubscribers(field, fieldChanges);

    if (fieldEntrie.validationType === 'onBlur') {
      this.validateField(field);
    }
  }

  /**Disable field. */
  public disable(field?: string) {
    const { fieldEntries, fieldStates } = this.state;

    const hasChild = this.hasChild(field);

    if (hasChild) {
      for (const nested in fieldEntries) {
        if (isFieldChild(field, nested)) {
          const nestedState = fieldStates[nested];
          const nestedChanges = setState<FieldState>(nestedState, { disabled: true });
          this.notifyFieldSubscribers(nested, nestedChanges);
        }
      }
    } else {
      const fieldState = fieldStates[field];
      const fieldChanges = setState<FieldState>(fieldState, { disabled: true });
      this.notifyFieldSubscribers(field, fieldChanges);
    }
  }

  /**Set custom data to field. */
  public setFieldData(field: string, dataName: string, value: any) {
    this.initDebug('SET DATA')
    const { fieldStates } = this.state;
    const fieldState = fieldStates[field];
    const currentData = fieldStates[field].data || {};

    const changes = setState<FieldState>(fieldState, { data: { ...currentData, [dataName]: value } });

    this.log('FIELDSTATE', fieldState);

    this.endDebug();

    this.notifyFieldSubscribers(field, changes);
  }

  /**Do the field validation. */
  public async validateField(field: string, notifySubscribers: boolean = true): Promise<void> {
    const { fieldEntries, fieldStates, formState, validators: validatorsFunctions } = this.state;
    const { validators, stopValidationOnFirstError } = fieldEntries[field];

    this.log('VALIDATORS', validators)

    if (validators && validators.length) {
      const fieldState = fieldStates[field];

      let fieldChanges = setState<FieldState>(fieldState, { validating: true });
      let formChanges = setState<FormState>(formState, { validating: true });

      if (notifySubscribers) {
        this.notifyFormSubscribers(formChanges);
        this.notifyFieldSubscribers(field, fieldChanges);
      }

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

      fieldChanges = setState<FieldState>(fieldState, { validating: false, valid: !error, errors, error });

      formChanges = setState<FormState>(formState, {
        validating: false,
        valid: error ? false : !Object.keys(fieldStates).some(key => !fieldStates[key].valid),
        [`errors.${field}`]: { ...errors }
      });

      if (notifySubscribers) {
        this.notifyFormSubscribers(formChanges);
        this.notifyFieldSubscribers(field, fieldChanges);
      }
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
  public fieldSubscribe(field: string, callback: FieldSubscriptionCallback, options?: FieldSubscriptionOptions): void {
    const { fieldEntries, fieldSubscriptions } = this.state;
    options = options || { ...defaultFieldSubscriptionOptions };
    fieldSubscriptions[field].push({ callback, options });

    //Forcing notify the first time if field has validators.
    const { validators } = fieldEntries[field];
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

    const previousValue = get(formState.previousState.values, field) || '';
    const previousInitial = get(formState.previousState.values, field) || '';

    const { submitting } = formState;

    return {
      ...fieldState,
      previousState: {
        ...fieldState.previousState,
        value: previousValue,
        initial: previousInitial
      },
      value,
      initial,
      submitting
    };
  }

  /**Return form state. */
  public getState() {
    return this.state.formState;
  }

  /**Notify all field subscribers by field. */
  private notifyFieldSubscribers(field: string, changes?: string[], notifyNesteds: boolean = true) {
    const { fieldSubscriptions } = this.state;

    const currentState = this.getFieldState(field);

    changes = changes || getStateChanges<FieldState>(currentState);

    this.log('FIELD CHANGES: ', changes);

    const subscriptions = fieldSubscriptions[field];

    if (subscriptions) {
      for (const { options, callback } of subscriptions) {
        if (changes.some(change => options[change])) {
          callback(currentState);
        }
      }
    }
  }

  /**Notify all form subscribers. */
  private notifyFormSubscribers(changes?: string[]) {
    const { formSubscriptions } = this.state;

    const currentState = this.getState();

    changes = changes || getStateChanges<FormState>(currentState);

    this.log('FORM CHANGES: ', changes);

    for (const { options, callback } of formSubscriptions) {
      if (changes.some(change => options[change])) {
        callback(currentState);
      }
    }
  }

  /**Notify all subscribes of all fields. */
  private notifyAllSubscribers() {
    const { fieldEntries, formState, formSubscriptions, fieldSubscriptions } = this.state;

    //Notifying form subscribers.
    this.notifyFormSubscribers();

    //Notifying field subscribers.
    for (const field in fieldEntries) {
      this.notifyFieldSubscribers(field);
    }
  }

  /**Returns if a field has child fields. */
  private hasChild(field: string): boolean {
    const { fieldEntries } = this.state;
    return Object.keys(fieldEntries).some(nested => isFieldChild(field, nested));
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
