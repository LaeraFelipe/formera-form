

import * as _ from 'lodash';
import { isEqual } from './utils';
console.log('isEqual', isEqual)

const initialValues = {
  name: 'NameTest',
  lastName: 'LastNameTest',
  gender: 'Male',
  typeId: 1,
  address: [
    {
      zipCode: '17045',
      city: 'North Jeramyland',
      street: 'Gerlach Mission',
      numer: '120'
    },
    {
      zipCode: '170442',
      city: 'Nova York',
      street: 'Test street',
      numer: '500'
    }
  ],
  phones: [
    {
      description: 'Telefone 1',
      phone: '(99) 999999999'
    },
    {
      description: 'Telefone 2',
      phone: '(35) 999999999'
    }
  ]
}

const otherValues = {
  name: 'NameTest',
  lastName: 'LastNameTest',
  gender: 'Male',
  typeId: 1,
  address: [
    {
      zipCode: '17045',
      city: 'North Jeramyland',
      street: 'Gerlach Mission',
      numer: '120'
    },
    {
      zipCode: '170442',
      city: 'Nova York',
      street: 'Test street',
      numer: '500'
    }
  ],
  phones: [
    {
      description: 'Telefone 1',
      phone: '(99) 999999999'
    },
    {
      description: 'Telefone 2',
      phone: '(35) 999999999'
    }
  ]
}

console.time('tes')
console.log(isEqual(initialValues, otherValues));
console.timeEnd('tes')

console.time('LOD')
console.log(_.isEqual(initialValues, otherValues));
console.timeEnd('LOD')



