/**Make the functions not execute multiple times. */
export default function debouncePromise(func: Function, wait: number): Function {
  let timeout = null;
  return function () {
    const context = this, args = arguments;

    return new Promise((resolve, reject) => {
      const later = function () {
        timeout = null;
        const funcResult = func.apply(context, args);
        const isFuncPromise = funcResult && funcResult.then && typeof funcResult.then === "function";

        if (isFuncPromise) {
          funcResult
            .then((result: string) => resolve(result))
            .catch((error: any) => reject(error))
        } else {
          resolve(funcResult);
        }
      }

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    });
  }
}