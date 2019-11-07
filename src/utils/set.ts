import clone from './clone';

type ArrayValues = { arrayPath: string[], value: any }[];

type LevelChange = { isLastKey: boolean, key: string, value: any };

type LevelInfo = { isArray: boolean, levelChanges: { [key: string]: LevelChange } };

/**Separates the path in parts. */
function pathToArray(path: string): string[] {
  return path.split(/[.[\]]+/).filter(Boolean);
}

/**Return if a level is an array. */
function isLevelArray(values: ArrayValues, level: number): boolean {
  return values.some(item => item.arrayPath[level] && !isNaN(+item.arrayPath[level]));
}

/**Set value in object recursivaly. */
function setRecursivaly(current: any, changes: ArrayValues, level = 0) {
  const isArray = isLevelArray(changes, level);

  let result = undefined;

  if (isArray) {
    if (current !== undefined && Array.isArray(current)) {
      result = [...current];
    } else {
      result = [];
    }

    let changeIndex = 0;
    for (const change of changes) {
      const { arrayPath, value } = change;

      if (!arrayPath[level]) continue;

      const numericKey = +arrayPath[level];
      const isLastPath = level === (arrayPath.length - 1);

      if (isLastPath) {
        result[numericKey] = value;
        changes.splice(changeIndex, 1);
      } else {
        result[numericKey] = setRecursivaly(result[numericKey], changes, level + 1);
      }
      changeIndex++;
    }


  } else {
    if (current !== undefined) {
      result = { ...current };
    } else {
      result = {};
    }

    let changeIndex = 0;
    for (const change of changes) {
      const { arrayPath, value } = change;

      if (!arrayPath[level]) continue;

      const key = arrayPath[level];
      const isLastPath = level === (arrayPath.length - 1);

      if (isLastPath) {
        result[key] = value;
        changes.splice(changeIndex, 1);
      } else {
        result[key] = setRecursivaly(result[key], changes, level + 1);
      }
      changeIndex++;
    }
  }
  return result;
}

/**Set value in object. */
export default function set(object: any, values: { [key: string]: any }, level: number = 0) {
  let mappedValues: ArrayValues = [];

  //Mapping the values to change.
  Object.keys(values)
    .forEach(key => mappedValues.push({ arrayPath: pathToArray(key), value: values[key] }));

  return setRecursivaly(object, mappedValues);
}
