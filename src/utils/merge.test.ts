import merge from './merge';

const firstObject = {
  first: 123,
  second: 222
}

const secondObject = {
  first: 999,
  second: undefined
}

describe('merge base tests', () => {
  it('should not be defined with first value object', () => {
    const result = merge(firstObject, secondObject);

    expect(result.second).toBe(222);
  })
})