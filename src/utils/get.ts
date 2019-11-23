import pathToArray from "./pathToArray";

/**Get value inside object. */
export default function get(object: any, path: string): any {
  if (path == null || path === '') {
    return object;
  }

  const arrayPath = pathToArray(path);
  let current: any = object;
  for (let index = 0; index < arrayPath.length; index++) {
    current = current[arrayPath[index]];
    if (current == null) return undefined;
  }
  return current;
}