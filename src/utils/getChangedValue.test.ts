import getChangedValue from './getChangedValue';


describe('getChangedValue base tests', () => {
  it('shoud return correct value', () => {
    expect(getChangedValue(undefined)).toBe(undefined);
    expect(getChangedValue({ target: { value: 'this' } })).toBe('this');
    expect(getChangedValue('this')).toBe('this');
  })
})
