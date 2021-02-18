import initializeValidators from "./validation";
import {
  defaultFormState,
  defaultFieldState,
  defaultFieldSubscriptionOptions,
  defaultFormSubscriptionOptions,
  defaultFieldRegisterOptions,
  defaultFormOptions,
} from "./defaultValues";
import {
  debouncePromise,
  clone,
  cloneState,
  get,
  setState,
  isEqual,
  merge,
  isFieldChild,
  set,
} from "./utils";
import {
  FormState,
  FormOptions,
  FieldSubscriptionOptions,
  FormSubscriptionCallback,
  FieldSubscriptionCallback,
  FormSubscriptionOptions,
  FieldRegisterOptions,
  FieldState,
  InternalState,
  FieldHandler,
  ValidatorFunction,
} from "./types";
import { getStateChanges } from "./utils/state";

/**Timer identifier to log. */
const EXECUTION_TIMER_IDENTIFIER = "[FORMERA] EXECUTION TIME: ";

/**Formera class. */
export default class Formera {
  /**Internal form state. */
  private state: InternalState;

  /**Return if a form is in debug mode. */
  get debug() {
    return this.state.options.debug;
  }

  /**Initialize a form.
   * @param options Form inicialization options.
   */
  constructor(options: FormOptions) {
    this.state = {} as InternalState;

    this.state.options = merge(defaultFormOptions, options);

    this.initDebug("INIT");

    this.log("FORM OPTIONS", this.state.options);

    const { customValidators, customValidationMessages } = this.state.options;

    this.state.validators = initializeValidators(
      customValidators,
      customValidationMessages
    );

    this.state.fieldEntries = {};

    this.state.formState = {
      ...clone(defaultFormState),
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

  /**
   * Register the field.
   * @param name Field name.
   * @param options Field registration options.
   * @returns Function group used to change and subscribe to field-related values.
   */
  public registerField(
    name: string,
    options: FieldRegisterOptions = {}
  ): FieldHandler {
    this.initDebug("REGISTER", name);

    const { formState, options: formOptions } = this.state;

    if (this.state.fieldEntries[name] !== undefined) {
      this.state.fieldEntries[name] = {
        ...this.state.fieldEntries[name],
        ...options,
        validationType: options.validationType ?? formOptions.validationType,
        stopValidationOnFirstError:
          options.stopValidationOnFirstError ??
          defaultFieldRegisterOptions.stopValidationOnFirstError,
      };
      this.state.fieldEntries[name].entries++;
      this.validateField(name, false);
      return this.state.fieldEntries[name].handler;
    }

    this.log("FIELD OPTIONS", options);

    this.state.fieldEntries[name] = {
      entries: 1,
      ...defaultFieldRegisterOptions,
      ...options,
      validationType: options.validationType ?? formOptions.validationType,
      stopValidationOnFirstError:
        options.stopValidationOnFirstError ??
        defaultFieldRegisterOptions.stopValidationOnFirstError,
    };

    this.state.fieldStates[name] = {
      ...defaultFieldState,
      disabled: this.state.options.disabled,
      initial: clone(get(formState.values, name)),
      value: clone(get(formState.values, name)) || "",
    };

    this.state.fieldStates[name].previousState = clone(
      this.state.fieldStates[name]
    );

    this.state.fieldSubscriptions[name] = { index: 0, subscriptions: {} };

    this.state.fieldEntries[name].handler = {
      subscribe: (
        callback: FieldSubscriptionCallback,
        options?: FieldSubscriptionOptions
      ) => this.fieldSubscribe(name, callback, options),
      onChange: (value: any) => this.change(name, value),
      onBlur: () => this.blur(name),
      onFocus: () => this.focus(name),
      enable: () => this.enable(name),
      disable: () => this.disable(name),
      setData: (dataName: string, value: any) =>
        this.setFieldData(name, dataName, value),
    };

    //Doing the first validation in field.
    if (options.validators && options.validators.length) {
      this.validateField(name, false);
    }

    this.log("FIELD ENTRIE", this.state.fieldEntries[name]);
    this.log("FIELD STATE", this.state.fieldStates[name]);

    this.endDebug();

    return this.state.fieldEntries[name].handler;
  }

  /**
   * Unregister the field.
   * @param field Field name.
   */
  public unregisterField(field: string) {
    if (--this.state.fieldEntries[field].entries === 0) {
      delete this.state.fieldEntries[field];
      delete this.state.fieldStates[field];
      delete this.state.fieldSubscriptions[field];

      this.recalcFormValidation();
    }
  }

  /**Reset with initial values. */
  public reset(initialValues: any) {
    const { formState } = this.state;
    formState.initialValues = clone(initialValues);
    this.change(null, clone(initialValues));
  }

  /**
   * Do the focus actions in a field state.
   * @param field Field name.
   */
  public focus(field: string): void {
    this.initDebug("FOCUS", field);

    if (field == null || field === "") {
      throw new Error("You should pass a field to focus.");
    }

    let { formState, fieldStates } = this.state;
    let fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, { active: true });
    const formChanges = setState<FormState>(formState, { active: true });

    this.endDebug();

    this.notifyFormSubscribers(formChanges);
    this.notifyFieldSubscribers(field, fieldChanges);
  }

  /**
   * Do the change actions in a field state.
   * @param field Field name.
   * @param value Value to set.
   */
  public change(field: string, value: any): void {
    this.initDebug("CHANGE", field);

    const { formState, fieldStates, fieldEntries } = this.state;

    const hasChilds = this.hasChild(field);

    const compareFn = (field && fieldEntries[field].compareChanges) || isEqual;

    const previousValue = get(formState.values, field);
    const valueChanged = !compareFn(previousValue, value);
    const isPristine = compareFn(
      get(formState.initialValues, field) || "",
      value
    );

    //Getting the path to ser field value.
    const keyToSet = field ? `values.${field}` : "values";

    //Changing formstate.
    let formChanges = setState<FormState>(formState, {
      [keyToSet]: value,
    });

    if (isPristine !== formState.pristine) {
      formChanges = formChanges.concat(
        setState<FormState>(formState, {
          pristine: isEqual(formState.initialValues, formState.values),
        })
      );
    }

    this.notifyFormSubscribers(formChanges);

    //Validating and notifying current field.
    if (field) {
      const fieldEntry = fieldEntries[field];

      if (fieldEntry) {
        let fieldState = fieldStates[field];

        const fieldChanges = setState<FieldState>(fieldState, {
          pristine: isPristine,
        });
        if (valueChanged) fieldChanges.push("value");

        if (fieldEntry.validationType === "onChange") {
          this.validateField(field);
        }
        this.notifyFieldSubscribers(field, fieldChanges);
      }
    }

    //Validating and notifying all childs.
    if (hasChilds) {
      for (const nested in fieldEntries) {
        //Taking all fields including this one.
        if (isFieldChild(field, nested)) {
          //Updating pristine.
          const nestedFieldState = fieldStates[nested];

          const nestedValue = get(formState.values, nested);
          const nestedPreviousValue = get(
            formState.previousState.values,
            nested
          );
          const nestedInitialValue = get(formState.initialValues, nested);

          const isNestedPristine = isEqual(nestedValue, nestedInitialValue);
          const isNestedModified = !isEqual(nestedValue, nestedPreviousValue);

          let nestedFieldChanges = setState<FieldState>(nestedFieldState, {
            pristine: isNestedPristine,
          });

          if (isNestedModified) {
            nestedFieldChanges.push("value");
          }

          this.notifyFieldSubscribers(nested, nestedFieldChanges);

          //Forcing to validate all childs if your value change.
          if (isNestedModified) {
            this.validateField(nested);
          }
        }
      }
    }
    this.endDebug();
  }

  /**
   * Do the blur actions in a field state.
   * @param field Field name.
   */
  public blur(field: string): void {
    this.initDebug("BLUR", field);

    if (field == null || field === "") {
      throw new Error("You should pass a field to blur.");
    }

    const { fieldEntries, fieldStates, formState } = this.state;

    const fieldEntry = fieldEntries[field];
    let fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, {
      active: false,
      touched: true,
      dirty: !fieldState.pristine,
    });

    const formChanges = setState<FormState>(formState, {
      active: true,
      touched: true,
      dirty: !formState.pristine,
    });

    this.log("FIELDSTATE", fieldState);

    this.endDebug();

    this.notifyFormSubscribers(formChanges);
    this.notifyFieldSubscribers(field, fieldChanges);

    if (fieldEntry.validationType === "onBlur") {
      this.validateField(field);
    }
  }

  /**
   * Enable field.
   * @param field Field name.
   * @param enable If the field shoud be enable or not.
   */
  public enable(field?: string, enable: boolean = true) {
    const { fieldEntries, fieldStates } = this.state;

    const hasChild = this.hasChild(field);

    if (field) {
      const fieldState = fieldStates[field];
      const fieldChanges = setState<FieldState>(fieldState, {
        disabled: !enable,
      });
      this.notifyFieldSubscribers(field, fieldChanges);
    } else {
      this.state.options.disabled = !enable;
      this.notifyFormSubscribers();
    }

    if (hasChild) {
      for (const nested in fieldEntries) {
        if (isFieldChild(field, nested)) {
          const nestedState = fieldStates[nested];
          const nestedChanges = setState<FieldState>(nestedState, {
            disabled: !enable,
          });
          this.notifyFieldSubscribers(nested, nestedChanges);
        }
      }
    }
  }

  /**
   * Disable field.
   * @param field Field name.
   */
  public disable(field?: string) {
    this.enable(field, false);
  }

  /**
   * Set custom data to field.
   * @param field Field name.
   * @param dataName Name of da random data.
   * @param values Data to set.
   */
  public setFieldData(field: string, dataName: string, value: any) {
    this.initDebug("SET DATA", field);
    const { fieldStates } = this.state;
    const fieldState = fieldStates[field];
    const currentData = fieldStates[field].data || {};

    const changes = setState<FieldState>(fieldState, {
      data: { ...currentData, [dataName]: value },
    });

    this.log("FIELDSTATE", fieldState);

    this.endDebug();

    this.notifyFieldSubscribers(field, changes);
  }

  /**Returns if the field has nested fields with error. */
  public hasNestedErrors(field: string): boolean {
    if (field == null || field === "") {
      throw new Error("You should pass a field to check nested errors.");
    }

    const { fieldEntries, fieldStates } = this.state;

    for (const nested in fieldEntries) {
      if (isFieldChild(field, nested)) {
        const fieldState = fieldStates[nested];
        if (!fieldState.valid) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Finish field validation.
   * @param field Field name.
   * @param error Error.
   * @param errors All errors.
   * @param notifySubscribers If should notify subscribers.
   */
  private finishFieldValidation(
    field: string,
    error: string,
    errors: { [validator: string]: string },
    notifySubscribers: boolean = false
  ) {
    const { fieldStates, formState } = this.state;

    const fieldState = fieldStates[field];

    const fieldChanges = setState<FieldState>(fieldState, {
      validating: false,
      valid: !error,
      errors,
      error,
    });

    let formValidating = false,
      formValid = true;

    //Calculating form validation props.
    for (const key in fieldStates) {
      if (fieldStates[key].validating) {
        formValidating = true;
      }

      if (!fieldStates[key].valid) {
        formValid = false;
      }
    }

    const formChanges = setState<FormState>(formState, {
      validating: formValidating,
      valid: formValid,
      [`errors.${field}`]: { ...errors },
    });

    if (notifySubscribers) {
      this.notifyFormSubscribers(formChanges);
      this.notifyFieldSubscribers(field, fieldChanges);
    }
    return;
  }

  /**
   * Do the field validation.
   * @param field Field name.
   * @param notifySubscribers If should notify subscribers.
   */
  private validateField(field: string, notifySubscribers: boolean = true) {
    const {
      fieldEntries,
      fieldStates,
      formState,
      validators: validatorsFunctions,
    } = this.state;

    const fieldEntry = fieldEntries[field];
    const fieldState = fieldStates[field];

    const { validators, stopValidationOnFirstError } = fieldEntry;

    if (validators && validators.length) {
      this.log("VALIDATORS", validators);
      //Setting validating true in fieldState and formState.
      let fieldChanges = setState<FieldState>(fieldState, { validating: true });
      let formChanges = setState<FormState>(formState, { validating: true });

      //Notifying subscribers.
      if (notifySubscribers) {
        this.notifyFormSubscribers(formChanges);
        this.notifyFieldSubscribers(field, fieldChanges);
      }

      let validatorPromises: Array<Promise<string>> = [],
        validatorPromisesNames: Array<string> = [],
        errors: { [validator: string]: string } = {},
        error: string;

      for (const validator of validators) {
        let validatorName: string,
          validatorParams = [],
          debounce: number,
          validatorFunction: ValidatorFunction;

        if (typeof validator === "object") {
          validatorName = validator.name;
          validatorParams = validator.params ?? [];
          debounce = validator.debounce;
          validatorFunction =
            validator.func ?? validatorsFunctions[validatorName];
        } else {
          validatorName = validator;
          validatorFunction = validatorsFunctions[validatorName];
        }

        if (validatorFunction) {
          const fieldStateWithValue = this.getFieldState(field);

          let result = null;

          if (debounce) {
            fieldEntry.debounceRefs = fieldEntry.debounceRefs || {};

            fieldEntry.debounceRefs[validatorName] =
              fieldEntry.debounceRefs[validatorName] ||
              debouncePromise(validatorFunction, debounce);

            result = fieldEntry.debounceRefs[validatorName](
              fieldStateWithValue,
              this,
              ...validatorParams
            );
          } else {
            result = validatorFunction(
              fieldStateWithValue,
              this,
              ...validatorParams
            );
          }

          const isValidatorPromisse = typeof result?.then === "function";

          //If validator function has result.
          if (result) {
            //If validator return a promise.
            if (isValidatorPromisse) {
              validatorPromisesNames.push(validatorName);
              validatorPromises.push(result);
            } else {
              //Setting the first error.
              if (!error) {
                error = result;
              }
              //Setting the error for validator name.
              errors[validatorName] = result;

              //Stops loop.
              if (stopValidationOnFirstError) {
                break;
              }
            }
          }
        } else {
          throw new Error(
            `The validator "${validatorName}" in field "${field}" dosent exist. `
          );
        }
      }

      //If has error and should stop validation on first error.
      if (
        (error && stopValidationOnFirstError) ||
        validatorPromises.length === 0
      ) {
        this.finishFieldValidation(field, error, errors, notifySubscribers);
        return;
      }
      //If are promises for validate.
      else {
        Promise.all(validatorPromises)
          .then((results) => {
            for (let index = 0; index < results.length; index++) {
              const result = results[index];

              if (result) {
                errors[validatorPromisesNames[index]] = result;

                if (!error) {
                  error = result;
                }

                if (stopValidationOnFirstError) {
                  break;
                }
              }
            }

            this.finishFieldValidation(field, error, errors, notifySubscribers);
          })
          .catch((validationError) => {
            this.log("VALIDATION REJECT", validationError);
            this.finishFieldValidation(
              field,
              validationError.message,
              errors,
              notifySubscribers
            );
          });
      }
    } else {
      this.finishFieldValidation(field, undefined, {}, notifySubscribers);
    }
  }

  /**Set all fields blur. */
  public setAllFieldsTouched() {
    const { fieldStates } = this.state;

    //Setting all fields touched.
    for (const field in fieldStates) {
      setState<FieldState>(fieldStates[field], { touched: true });
    }

    this.notifyAllSubscribers();
  }

  /**Submmit the form. */
  public async submit() {
    const { options, formState } = this.state;
    const { onSubmit, allowInvalidSubmit } = options;

    if (!formState.valid && !allowInvalidSubmit) {
      this.setAllFieldsTouched();
      return;
    }

    setState<FormState>(formState, { submitting: true });

    this.notifyAllSubscribers();

    await onSubmit(formState);

    setState<FormState>(formState, { submitting: false });

    this.notifyAllSubscribers();
  }

  /**
   * Do the field subscription.
   * @param field Field name.
   * @param callback Callback to be called when field state changes.
   * @param options Parts of the state to listen.
   */
  public fieldSubscribe(
    field: string,
    callback: FieldSubscriptionCallback,
    options?: FieldSubscriptionOptions
  ): number {
    const { fieldSubscriptions } = this.state;
    options = options || { ...defaultFieldSubscriptionOptions };

    fieldSubscriptions[field].subscriptions[
      ++fieldSubscriptions[field].index
    ] = { callback, options };

    return fieldSubscriptions[field].index;
  }

  /**
   * Do the field unsubscription.
   * @param field Field name.
   * @param subscriptionkey The subscriptionkey returned in subscribe.
   */
  public fieldUnsubscribe(field: string, subscriptionkey: number): void {
    const { fieldSubscriptions } = this.state;

    if (fieldSubscriptions[field]?.subscriptions?.[subscriptionkey]) {
      delete fieldSubscriptions[field].subscriptions[subscriptionkey];
    }
  }

  /**
   * Do the form subscription.
   * @param callback Callback to be called when form state changes.
   * @param options Parts of the state to listen.
   */
  public formSubscribe(
    callback: FormSubscriptionCallback,
    options: FormSubscriptionOptions = { ...defaultFormSubscriptionOptions }
  ): void {
    this.state.formSubscriptions.push({ callback, options });
  }

  /**
   * Return the builded field state with current and initial value.
   * @param field Field name.
   */
  public getFieldState(field: string): FieldState {
    const { fieldStates, formState } = this.state;

    const fieldState = fieldStates[field];

    if (fieldState === undefined) {
      return undefined;
    }

    const value = get(formState.values, field) ?? "";
    const initial = get(formState.initialValues, field) ?? "";

    const previousValue = get(formState.previousState.values, field) ?? "";
    const previousInitial = get(formState.previousState.values, field) ?? "";

    const { submitting } = formState;

    return {
      ...fieldState,
      previousState: {
        ...fieldState.previousState,
        value: previousValue,
        initial: previousInitial,
      },
      value,
      initial,
      submitting,
    };
  }

  /**Returns an array with all fields. */
  public getFields(): string[] {
    return Object.keys(this.state.fieldEntries);
  }

  /**Return form state. */
  public getState() {
    return this.state.formState;
  }

  /**Returns a value from form values by path. */
  public getValue(path?: string) {
    return get(this.state.formState.values, path);
  }

  /**
   * Notify all field subscribers by field.
   * @param field Field name.
   * @param changes State changes to be compared..
   */
  public notifyFieldSubscribers(field: string, changes?: string[]) {
    const { fieldSubscriptions } = this.state;

    const currentState = this.getFieldState(field);

    changes = changes || getStateChanges<FieldState>(currentState);

    const subscriptions = fieldSubscriptions[field].subscriptions;

    if (subscriptions) {
      for (const subscriptionKey in subscriptions) {
        const { options, callback } = subscriptions[subscriptionKey];

        if (changes.some((change) => options[change])) {
          callback(currentState);
        }
      }
    }
  }

  /**
   * Return all registered fields;
   */
  getRegisteredFieldNames(): Array<string> {
    const { fieldEntries } = this.state;
    return Object.keys(fieldEntries);
  }

  /**
   * Notify all form subscribers.
   * @param changes State changes to be compared.
   */
  private notifyFormSubscribers(changes?: string[]) {
    const { formSubscriptions } = this.state;

    const currentState = this.getState();

    changes = changes || getStateChanges<FormState>(currentState);

    this.log("FORM CHANGES: ", changes);

    for (const { options, callback } of formSubscriptions) {
      if (changes.some((change) => options[change])) {
        callback(currentState);
      }
    }
  }

  /**Notify all subscribes of all fields. */
  private notifyAllSubscribers() {
    const { fieldEntries } = this.state;

    //Notifying form subscribers.
    this.notifyFormSubscribers();

    //Notifying field subscribers.
    for (const field in fieldEntries) {
      this.notifyFieldSubscribers(field);
    }
  }

  /**Recalc form validation. */
  private recalcFormValidation() {
    let valid = true,
      errors = {};
    for (const field in this.state.fieldStates) {
      const fieldState = this.state.fieldStates[field];

      if (!fieldState.valid) {
        valid = fieldState.valid;
        set(errors, field, fieldState.errors);
      }
    }

    const changes = setState<FormState>(this.state.formState, {
      valid,
      errors,
    });

    this.notifyFormSubscribers(changes);
  }

  /**
   * Returns if a field has child fields.
   * @param field Field name.
   */
  private hasChild(field: string): boolean {
    const { fieldEntries } = this.state;
    return Object.keys(fieldEntries).some((nested) =>
      isFieldChild(field, nested)
    );
  }

  /**
   * Log messages.
   * @param logs Messages to log.
   */
  private log(...logs: any): void {
    const { options } = this.state;
    if (options.debug) console.log("[FORMERA]", ...logs);
  }

  /**
   * Init the debug log with timer.
   * @param action Current action.
   * @param field Field name.
   */
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
