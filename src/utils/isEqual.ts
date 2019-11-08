/**Return if a value is a object. */
function isObject(value: any) {
  return typeof value === 'object';
}

/**Return if two values is equals. */
export default function isEqual(value: any, other: any) {
  if (value === other) {
    return true;
  }

  if (value == null || other == null || (!isObject(value) && !isObject(other))) {
    return false;
  }

  return true;
}