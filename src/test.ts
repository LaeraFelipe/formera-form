import Formera from "./Formera";
import clone from './utils/clone';

import * as _ from 'lodash';
import set from "./utils/set";
import get from "./utils/get";

const object = {};

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


console.time('MEU SET')
set(initialValues, 'address[2].zipCode', 111);
console.timeEnd('MEU SET');
console.time('LOD')
_.set(initialValues, 'address[2].zipCode', 111);
console.timeEnd('LOD');
console.time('MEU get')
const result = get(initialValues, 'address[1].zipCode');
console.timeEnd('MEU get');

console.log('result :', result);

console.time('LOD GET')
_.get(initialValues, 'address[2].zipCode');
console.timeEnd('LOD GET');
