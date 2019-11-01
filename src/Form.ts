import { FormState, FieldEntries, FormOptions, FieldHandler, FieldStates } from "./types";
import { cloneDeep, set, get } from 'lodash';
import { initialFormState, initialFieldState } from "./initialValues";
import { getFieldValueFromSource } from "./utils";

export default class Form {
  /**Indicates if the form is in debug mode. */
  private debug: boolean = false;

  /**Registered fields. */
  private entries: FieldEntries;

  /**Form state. */
  private state: FormState;

  /**Field states. */
  private fieldStates: FieldStates;

  /**Initialize a form with options. */
  constructor(options: FormOptions) {
    this.debug = !!options.debug;

    this.entries = {};

    this.state = {
      ...initialFormState,
      initialValues: cloneDeep(options.initialValues),
      previousValues: cloneDeep(options.initialValues),
      values: cloneDeep(options.initialValues)
    };

    this.fieldStates = {};

    this.change = this.change.bind(this);
    this.blur = this.blur.bind(this);
    this.focus = this.focus.bind(this);

    this.log('Form initialized.');
  }

  /**Register the field. */
  public registerField(name: string): FieldHandler {
    this.entries[name] = {
      name,
      subscriptions: [],
    };

    this.fieldStates[name] = {
      ...initialFieldState,
      initialValue: getFieldValueFromSource(name, this.state.initialValues),
      previousValue: getFieldValueFromSource(name, this.state.initialValues),
      value: getFieldValueFromSource(name, this.state.initialValues)
    }

    this.log(`The field ( ${name} ) has been registered with state: \n`, JSON.stringify(this.fieldStates[name], null, 2));

    return {
      onChange: (value: any) => this.change(name, value),
      onBlur: () => this.blur(name),
      onFocus: () => this.focus(name),
    }
  }

  /**Do the focus actions in a field state. */
  public focus(field: string): void {
    let currentField = this.fieldStates[field];

    currentField.active = true;

    this.log(`Focus on field: ( ${field} ).`, currentField);
    this.notifySubscribers(field);
  }

  /**Do the change actions in a field state. */
  public change(field: string, value: any): void {
    let currentField = this.fieldStates[field];

    currentField.previousValue = currentField.value;
    currentField.value = value;

    set(this.state.previousValues, field, currentField.previousValue);
    set(this.state.values, field, currentField.value);

    currentField.pristine = currentField.initialValue === currentField.value;

    this.state.pristine = !currentField.pristine ? currentField.pristine : this.isFormPristine();

    this.log(`Change on field: ( ${field} ).`, currentField);

    this.notifySubscribers(field);
  }

  /**Do the blur actions in a field state. */
  public blur(field: string): void {
    let currentField = this.fieldStates[field];

    currentField.active = false;
    currentField.touched = true;

    currentField.dirty = !currentField.pristine;

    this.state.touched = true;

    this.log(`Blur on field: ( ${field} ).`, currentField);
    this.notifySubscribers(field);
  }

  private notifySubscribers(name: string) {
    const field = this.entries[name];
    const { subscriptions } = field;

    this.log(`Notifying subscribers for field (${name}).`);

    if (subscriptions && subscriptions.length) {
      // const formValues = cloneDeep(this.state.values);
      // const fieldState = cloneDeep(this.state.fields[field.name]);

      for (const subcription of subscriptions) {
        // subcription(fieldState, formValues);
      }
    }
  }

  /**Return form state. */
  getState() {
    return this.state;
  }

  /**Calculate if the form is pristine. */
  private isFormPristine() {
    for (const key in this.fieldStates) {
      if (!this.fieldStates[key].pristine) return false;
    }
    return true;
  }

  /**Verify if a field is registered. */
  private hasField(name: string): boolean {
    return Object.keys(this.entries).some(registeredName => registeredName === name);
  }

  private log(...logs: any): void {
    if (this.debug) console.log('[FORMERA] ', ...logs);
  }
}
