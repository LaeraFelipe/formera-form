import get from './get';

const testObject = {
  name: 'test',
  lastName: 'test',
  gender: 'test',
  typeId: 1,
  address: [
    {
      zipCode: '1111',
      city: 'Test city 1',
      street: 'Test street 1',
      numer: '11111'
    },
    {
      zipCode: '2222',
      city: 'Test city 2',
      street: 'Test street 2',
      numer: '22222'
    }
  ],
  phones: [
    {
      description: 'Test phone 1',
      phone: '(11) 111111111'
    },
    {
      description: 'Test phone 2',
      phone: '(22) 222222222'
    }
  ]
}

describe('get base tests', () => {
  it('should return a right value', () => {
    expect(get(testObject, 'typeId'))
      .toBe(1);
  });

  it('should return a nested right value', () => {
    expect(get(testObject, 'address[1].zipCode'))
      .toBe('2222');
  });

  it('should return undefined', () => {
    expect(get(testObject, 'address[1].otherPropertye'))
      .toBe(undefined);
  });
})
