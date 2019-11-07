import clone from './clone';

type ArrayValues = { arrayPath: string[], value: any }[];

type LevelChange = { isLastKey: boolean, key: string, value: any };

type LevelInfo = { isArray: boolean, levelChanges: { [key: string]: LevelChange } };

/**Separates the path in parts. */
function pathToArray(path: string): string[] {
  return path.split(/[.[\]]+/);
}

/**Return simplified level changes. */
function getLevelInfo(values: ArrayValues, level: number): LevelInfo {
  let isArray: boolean;
  let levelChanges: { [key: string]: LevelChange } = {};

  for (const item of values) {
    if (!item.arrayPath[level]) continue;

    if (isArray === undefined) {
      isArray = !isNaN(+item.arrayPath[level])
    }

    const key = item.arrayPath[level];

    levelChanges[key] = {
      isLastKey: (item.arrayPath.length - 1) === level,
      key: item.arrayPath[level],
      value: item.value,
    }
  }

  return { isArray, levelChanges };
}

/**Set value in object recursivaly. */
function setRecursivaly(current: any, changes: ArrayValues, level = 0) {
  const { isArray, levelChanges } = getLevelInfo(changes, level);

  let result: {} | [];

  if (isArray) {
    result = [];
    //Keys of current array.
    let keys: any[] = current ? Object.keys(current) : [];
    //Adding new keys.
    Object.keys(levelChanges).forEach(key => {
      if (keys.indexOf(key) === -1) keys.push(key);
    })

    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      
    }


  } else {
    result = {};
    //Keys of current object.
    let keys: any[] = current ? Object.keys(current) : [];
    //Adding new keys.
    Object.keys(levelChanges).forEach(key => {
      if (keys.indexOf(key) === -1) keys.push(key);
    })

    for (const key of keys) {
      if (levelChanges[key]) {
        const { isLastKey, value } = levelChanges[key];
        if (isLastKey) {
          result[key] = value;
        } else {
          result[key] = setRecursivaly(current ? current[key] : undefined, changes, level + 1);
        }
      } else {
        result[key] = clone(current[key]);
      }
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
