
/**Set value in object recursivaly. */
function setRecursivaly(object: any, path: string[], index: number, value: any) {
  if (!object) return;

  const isLastKey = index == path.length;

  const key = path[index];

  //Its an object.
  if (isNaN(+key)) {
    if (isLastKey) {
      object[key] = value;
    } else {
      setRecursivaly(object[key], path, index + 1, value);
    }
  }
  //Its an array.
  else {
    const numericKey = +key;
    if (isLastKey) {
      object[numericKey] = value;
    } else {
      setRecursivaly(object[numericKey], path, index + 1, value);
    }
  }
}

/**Set value in object. */
export default function set(object: any, path: string, value: any) {
  setRecursivaly(object, path.split(/\[.\[\]]/), 0, value);
}
