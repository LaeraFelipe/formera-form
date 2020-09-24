/**Return if a value is a object. */
function isObject(value: any): boolean {
  return typeof value === 'object';
}

/**Compare arrays. */
function isArrayEqual(value: Array<any>, other: Array<any>): boolean {
  if (value.length !== other.length) return false;

  const maxLength = Math.max(value.length, other.length);

  for (let index = 0; index < maxLength; index++) {
    if (!isEqual(value[index], other[index])) {
      return false;
    }
  }

  return true;
}

/**Compare objects. */
function isObjectEqual(value: any, other: any): boolean {
  let keys = Object.keys(value);
  let otherKeys = Object.keys(other);

  if (keys.length !== otherKeys.length) return false;

  keys.forEach(otherKey => keys.indexOf(otherKey) === -1 && keys.push(otherKey));

  for (const key of keys) {
    if (!isEqual(value[key], other[key])) {
      return false;
    }
  }

  return true;
}

/**Return if two values is equals. */
export default function isEqual(value: any, other: any) {
  if (value === other) {
    return true;
  }

  if (value == null || other == null || (!isObject(value) && !isObject(other))) {
    return false;
  }

  if (value.toString() !== other.toString()) return false;

  const valueIsArray = Array.isArray(value);
  const otherIsArray = Array.isArray(other);

  if (valueIsArray !== otherIsArray) {
    return false;
  }

  //Compare arrays.
  if (valueIsArray && otherIsArray) {
    if (!isArrayEqual(value, other)) {
      return false;
    }
  }
  //Compare objects.
  else {
    if (!isObjectEqual(value, other)) {
      return false;
    }
  }

  return true;
}


