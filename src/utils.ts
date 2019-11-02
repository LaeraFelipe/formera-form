import { cloneDeep, get, set, isEqual } from 'lodash';

/**Extract the field value from a source using deep copy if necessary. */
export function getFieldValueFromSource(path: string, source: any) {
  let value = get(source, path);

  //Cloning the value if it is an object to prevent unwanted modifications.
  if (typeof value === "object") {
    return cloneDeep(value);
  } else {
    return value;
  }
}

/**Get the value received in change event. */
export function getChangeValue(value: any) {
  if (value.target) {
    return value.target.value;
  } else {
    return value;
  }
}

/**Clone state. */
export function cloneState(state: any, clonePreviousValues = false) {
  let clone = {};
  for (const key in state) {
    if (clonePreviousValues || key !== 'previousValues') {
      clone[key] = state[key];
    }
  }
  return clone;
}

/**Set state value. */
export function setState(state: any, path: string, value: any) {
  if (!state.previousState) {
    state.previousState = cloneState(state)
  }
  set(state.previousState, path, get(state, path));
  set(state, path, value);
}

/**Get state changes. */
export function getStateChanges(state: any): Array<string> {
  const { previousState } = state;

  let changes = [];

  for (const key in state) {
    if (['previousState'].indexOf(key) > -1) continue;

    if (typeof state[key] === "object") {
      if (!isEqual(previousState[key], state[key])) {
        changes.push(key);
      }
    } else {
      if (previousState[key] !== state[key]) {
        changes.push(key);
      }
    }
  }

  return changes;
}