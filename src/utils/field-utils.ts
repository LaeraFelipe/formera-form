import { FieldState } from "../types";
import { cloneDeep, get, set, isEqual as lodashEqual } from 'lodash';

/**Clone form state. */
export function cloneState(state: FieldState): Omit<FieldState, 'previousState'> {
  let clone: Omit<FieldState, 'previousState'> = {
    active: state.active,
    pristine: state.pristine,
    dirty: state.dirty,
    valid: state.valid,
    validating: state.validating,
    touched: state.touched,
    submitting: state.submitting,
    disabled: state.disabled,
    error: state.error,
    errors: { ...state.errors },
    value: typeof state.value === "object" ? cloneDeep(state.value) : state.value,
    initialValue: typeof state.value === "object" ? cloneDeep(state.initialValue) : state.initialValue,
    data: cloneDeep(state.data),
  };

  return clone;
}

/**Set form state. */
export function setState(state: FieldState, changes: { [key in keyof Partial<Omit<FieldState, 'previousState'>>]: any }) {
  state.previousState = cloneState(state);

  for (const key in changes) {
    set(state, key, changes[key]);
  }
}

/**Get field value from form values. */
export function getFieldValue(values: any, path: string) {
  let value = get(values, path);

  //Cloning the value if it is an object to prevent unwanted modifications.
  if (typeof value === "object") {
    return cloneDeep(value);
  } else {
    return value;
  }
}

/**Compare field values. */
export function isEqual(first: any, second: any) {
  if (typeof first === 'object') {
    return lodashEqual(first, second);
  } else {
    return first === second;
  }
}