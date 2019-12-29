import debouncePromise from './debounce';

describe('debounce base tests', () => {
  it('should execute function', () => {
    const cb = () => {
      expect(true).toBe(true)
    }

    const cbDebounced = debouncePromise(cb, 500);

    cbDebounced();
  });
})