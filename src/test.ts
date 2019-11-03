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
    debug: true,
    onSubmit: (test) => {}
  }
);

const nameHandler = form.registerField('name', { validators: ['required']});

nameHandler.subscribe((fieldstate) => {
  console.log('Runing subscribe.')
}, { value: true });


nameHandler.onFocus();

nameHandler.onChange(`jamantex`);

nameHandler.onBlur();

// console.log('Formstate', JSON.stringify(form.getState(), null, 2));


