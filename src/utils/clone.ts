/**Clone objects. */
export default function clone(object: any): any {
  if (!object) return object;

  if (typeof object === "object") {
    //If is an array.
    if (Array.isArray(object)) {
      let cloneArray = [];
      for (const item of object) {
        cloneArray.push(clone(item));
      }
      return cloneArray;
    }
    //If is an date.
    else if (object instanceof Date) {
      return new Date(object);
    }
    //If is an literal.
    else {
      let cloneObject = {};
      for (const key in object) {
        cloneObject[key] = clone(object[key]);
      }
      return cloneObject;
    }
  } else {
    return object;
  }
}
