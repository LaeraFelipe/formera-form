/**Merge objects values. */
export default function merge(...objects: any[]) {
  let result: any = Array.isArray(objects[0]) ? [] : {};

  for (const object of objects) {
    for (const key in object) {
      if (object[key] !== undefined) {
        result[key] = object[key];
      }
    }
  }

  return result;
}   