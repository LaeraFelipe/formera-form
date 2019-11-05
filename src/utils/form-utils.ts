import { FormState, FieldState } from "../types";
import { cloneDeep, set } from 'lodash';

/**Clone form state. */
export function cloneState(state: FormState): Omit<FormState, 'previousState'> {
  let clone: Omit<FormState, 'previousState'> = {
    active: state.active,
    pristine: state.pristine,
    dirty: state.dirty,
    valid: state.valid,
    validating: state.validating,
    touched: state.touched,
    submitting: state.submitting,
    initialValues: cloneDeep(state.initialValues),
    values: cloneDeep(state.values),
    errors: { ...state.errors },
  };

  return clone;
}

/**Set form state. */
export function setState(state: FormState, changes: { [key in keyof Partial<Omit<FormState, 'previousState'>>]: any }) {
  state.previousState = cloneState(state);

  for (const key in changes) {
    set(state, key, changes[key]);
  }
}

/**Calculate if the form is pristine. */
export function isPristine(fieldStates: { [field: string]: FieldState }) {
  for (const key in fieldStates) {
    if (!fieldStates[key].pristine) return false;
  }
  return true;
}

/**Calculate if the form is valid. */
export function isValid(fieldStates: { [field: string]: FieldState }) {
  for (const key in fieldStates) {
    if (!fieldStates[key].valid) return false;
  }
  return true;
}

