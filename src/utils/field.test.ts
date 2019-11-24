import { isFieldChild } from './field';

describe('field utils base tests', () => {
  it('should return correct values', () => {
    expect(isFieldChild('teste', 'teste.teste')).toBe(true);
    expect(isFieldChild('teste', 'teste1')).toBe(false);
    expect(isFieldChild('', 'teste')).toBe(true);
  })
})