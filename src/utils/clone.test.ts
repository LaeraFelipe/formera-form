import clone from './clone';

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

describe('clone base tests', () => {
  it('shoud clone an object', () => {
    expect(clone(testObject))
      .not.toBe(testObject);

    expect(clone(testObject))
      .toStrictEqual(testObject);
  });

  it('should return an array', () => {
    expect(Array.isArray(clone(testObject.address)))
      .toBe(true);
  })
})
