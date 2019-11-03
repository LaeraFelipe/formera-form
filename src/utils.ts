import { cloneDeep, get, set, isEqual, omit } from 'lodash';

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

/**Set field state. */
export function setState(state: any, value: any) {
  state.previousState = cloneDeep(omit(state, 'previousState'));

  for (const key in value) {
    set(state, key, value[key]);
  }
}

export function isFieldValueEqual(first: any, second: any): boolean {
  if (typeof first === 'object') {
    return isEqual(first, second);
  } else {
    return first === second;
  }
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