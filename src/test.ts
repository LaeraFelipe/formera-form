import Formera from "./Formera";
import clone from './utils/clone';
import set from './utils/set';
import finforSet from './utils/finfor';

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

console.time('meu')
const result = set(initialValues, { 'teste_jam': 1, 'teste[8]': 'teste' });
console.timeEnd('meu')

console.time('finfor')
let resultfinfo = finforSet(initialValues, 'teste_jam', 1);
 resultfinfo = finforSet(initialValues, 'teste[8]', 'teste');
console.timeEnd('finfor')

// console.log('initialValues :', result);

