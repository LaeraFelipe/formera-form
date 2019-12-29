import debouncePromise from './utils/debounce';

const debouncedFunction = debouncePromise((...args) => {
  console.log('executei args', args);
}, 1000);

debouncedFunction(1,2,3);

debouncedFunction();

debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction();
debouncedFunction(1,2,3);