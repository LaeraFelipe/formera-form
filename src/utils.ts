import { cloneDeep, get } from 'lodash';

export function getFieldValueFromSource(path: string, source: any) {
  let value = get(source, path);

  //Cloning the value if it is an object to prevent unwanted modifications.
  if (typeof value === "object") {
    return cloneDeep(value);
  }else{
    return value;
  }
}