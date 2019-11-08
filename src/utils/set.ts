import pathToArray from "./pathToArray";

/**Set a value inside object. */
export default function set(object: any, path: string, value: any) {
  const arrayPath = pathToArray(path);
  const lastIndex = arrayPath.length - 1;

  let current: any = object;
  for (let index = 0; index < arrayPath.length; index++) {
    const key = arrayPath[index];

    let valueToSet: any;

    if (index != lastIndex) {
      valueToSet = current[key] !== undefined
        ? current[key]
        : (!isNaN(+arrayPath[index + 1]) ? [] : {});
    } else {
      valueToSet = value;
      current[key] = value;
    }

    current[key] = valueToSet;
    current = current[key];
  }
  return object;
}
