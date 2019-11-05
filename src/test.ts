import Formera from "./Formera";

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

const form = new Formera(
  {
    initialValues,
    debug: true,
    onSubmit: (values) => {
      console.log('submiting values :', values);
    }
  }
);

const nameHandler = form.registerField('name', { validators: ['required'] });

form.fieldSubscribe('name', (fieldstate) => {
  console.log('Runing subscribe.', fieldstate);
}, { value: true });


nameHandler.onFocus();

nameHandler.onChange(`changing value`);

nameHandler.onBlur();


