import isEqual from './isEqual';

const firstTestObject = {
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

const secondTestObject = {
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

const thirdTestObject = {
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
      description: 'Test phone 2 diferent',
      phone: '(22) 222222222'
    }
  ]
}

describe('isEqual base tests', () => {
  it('should be equal by reference', () => {
    expect(isEqual(firstTestObject, firstTestObject))
    .toBe(true);
  });

  it('should be equal by deep comparing', () => {
    expect(isEqual(firstTestObject, secondTestObject))
    .toBe(true);
  });

  it('should be different by deep comparing', () => {
    expect(isEqual(firstTestObject, thirdTestObject))
    .toBe(false);
  });
})