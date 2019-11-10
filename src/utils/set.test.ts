import set from "./set";

let objectToTest: any = { test: { nested: 'nested value' } };

describe('set base tests', () => {
  it('should create a nested value', () => {
    set(objectToTest, 'first.second[3].value', 1);

    expect(objectToTest.first.second[3].value)
      .toBe(1);
  });

  it('should modify a nested value', () => {
    set(objectToTest, 'test.nested', 'different nested value');

    expect(objectToTest.test.nested)
      .toBe('different nested value');
  });
})
