import Formera from "./Formera";
import clone from './utils/clone';
import set from './utils/set';
import finforSet from './utils/finfor';

import * as _ from 'lodash';
import setIn from "./utils/finfor";

const object = {};

// _.set(object, 'teste[5].jamanta[8].cloudNine', 21);

// console.log('object :', JSON.stringify(object, null, 2));



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
console.time('meu');
const result = set(initialValues, {
  'teste.teste.teste.teste.teste.chapecoense.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste': '12321321321312321'
});

// console.log('result :', JSON.stringify(result, null, 2));
console.timeEnd('meu');

console.time('deles');
const initial = _.cloneDeep(initialValues);
_.set(initial, 'teste', '1')
_.set(initial, 'address[1].tchacabum.testejamanta', 'teste2313123213')
_.set(initial, 'teste.teste.teste.teste.teste', '12321321321312321')
_.set(initial, 'teste.teste.teste.teste.teste.chapecoense.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste.teste', '12321321321312321')
console.timeEnd('deles');

console.time('finfor');

// const initialfinfor = clone(initialValues);
let resultfinfor = setIn(initialValues, 'teste', 1);
resultfinfor = setIn(initialValues, 'address[1].tchacabum.testejamanta', 'teste2313123213');
resultfinfor = setIn(initialValues, 'teste.teste.teste.teste.teste', '12321321321312321');
resultfinfor = setIn(initialValues, 'teste.teste.teste.teste.teste.chapecoense', '12321321321312321');

// console.log('initialfinfor :', resultfinfor);
console.timeEnd('finfor');



// console.log('result :', JSON.stringify(result, null, 2));


console.time('meu')
const tesd = set(initialValues, { 'teste_jam': 1, 'teste[8]': 'teste' });
console.timeEnd('meu')

console.time('finfor')
let resultfinfo = finforSet(initialValues, 'teste_jam', 1);
 resultfinfo = finforSet(initialValues, 'teste[8]', 'teste');
console.timeEnd('finfor')

// console.log('initialValues :', result);

