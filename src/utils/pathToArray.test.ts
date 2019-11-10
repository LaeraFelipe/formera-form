import pathToArray from './pathToArray';

const pathToTest = 'first[2].second.third';

describe('pathToArray base tests', () => {
  it('shoud return right value', () => {
    expect(pathToArray(pathToTest))
      .toStrictEqual(['first', '2', 'second', 'third']);
  })
})