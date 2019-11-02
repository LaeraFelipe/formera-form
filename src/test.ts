import Formera from "./Formera";

const initialValues = {
  name: 'Cleveland',
  lastName: 'O Reilly',
  gender: 'Masculino',
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
      city: 'Cambuquira',
      street: 'Rua Ordomundi Gomes Ferreira',
      numer: '890'
    }
  ],
  phones: [
    {
      description: 'Telefone 1',
      phone: '(35) 984262379'
    },
    {
      description: 'Telefone 2',
      phone: '(35) 999999999'
    }
  ]
}

const form = new Formera(
  {
    initialValues,
    debug: true
  }
);

const nameHandler = form.registerField('name');
const lastNameHandler = form.registerField('lastName');
const genderHandler = form.registerField('gender');
const typeIdHandler = form.registerField('typeId');

const firstAddressHandler = form.registerField('address[0].street');

firstAddressHandler.subscribe((fieldstate) => {
  console.log('Runing subscribe.')
}, { value: true });

let changeCount = 0;

firstAddressHandler.onFocus();

const interval = setInterval(() => {
  firstAddressHandler.onChange(`Rua mudada ${changeCount}`);
  changeCount++;

  if (changeCount == 5) clearInterval(interval);

}, 1000)
firstAddressHandler.onBlur();


console.log('----------------------------------------------------------------------------------------------------');

// console.log('Formstate', JSON.stringify(form.getState(), null, 2));


