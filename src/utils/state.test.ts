import { setState, getChangedKey } from './state';
import { State } from '../types';

let fakeState: State<any> = {
  disabled: true,
  active: true,
  dirty: false,
  pristine: true,
  touched: false,
  valid: false,
  validating: false,
  submitting: false,
  previousState: {
    disabled: true,
    active: false,
    dirty: true,
    pristine: true,
    touched: false,
    valid: false,
    validating: false,
  }
}

describe('setState basic tests', () => {

  const changes = setState(fakeState, {
    active: true, //true
    dirty: true, //false
    touched: true, //false
  });

  it('should return a correct changed key', () => {
    expect(getChangedKey('values.first.second')).toBe('values');
  });

  it('should return correct changes', () => {
    expect(changes)
      .toStrictEqual(['dirty', 'touched']);
  });

  it('should set correct state', () => {
    expect(fakeState.dirty).toBe(true);
    expect(fakeState.touched).toBe(true);
  });

  it('should set correct previous state', () => {
    expect(fakeState.previousState.dirty).toBe(false);
    expect(fakeState.previousState.active).toBe(true);
  })
})