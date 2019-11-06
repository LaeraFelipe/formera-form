type ArrayValues = { arrayPath: string[], value: any }[];

/**Separates the path in parts. */
function pathToArray(path: string): string[] {
  return path.split(/\[.\[\]]/);
}

/**Return if a level is an array. */
function isLevelArray(values: ArrayValues, level: number): boolean {
  return values.some(item => !isNaN(+item.arrayPath[level]));
}

/**Set value in object recursivaly. */
function setRecursivaly(object: any, values: ArrayValues, level = 0) {
  const valuesInLevel = values.filter(value => value.arrayPath[level]);

  const isArray = isLevelArray(valuesInLevel, level);

  let result = isArray ? [] : {};

  if (isArray) {
    for (const valueInLevel of valuesInLevel) {
      const isLastKey = level === (valueInLevel.arrayPath.length - 1);
      const currentKey = valueInLevel.arrayPath[level];

      if (isLastKey) {
        object[currentKey] = valueInLevel.value;
      }
    }
  } else {
    for (const valueInLevel of valuesInLevel) {
      const isLastKey = level === (valueInLevel.arrayPath.length - 1);
      const currentKey = valueInLevel.arrayPath[level];
    }
  }
}

/**Set value in object. */
export default function set(object: any, values: { [key: string]: any }, level: number = 0) {
  let mappedValues: ArrayValues = [];

  //Mapping the values to change.
  Object.keys(values)
    .forEach(key => mappedValues.push({ arrayPath: pathToArray(key), value: values[key] }));

  return setRecursivaly(object, mappedValues);
}
