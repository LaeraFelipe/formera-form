import Formera from '../dist/Formera';

//Creating custom validation functions to formera.
const customValidators = {
  //Creating a new validator.
  password: function ({ value }) {
    if (!value || value.length < 8) {
      return customValidationMessages.password;
    }
  }
}

//Creating custom validation messages to formera.
const customValidationMessages = {
  //Replacing the message to default validator required.
  required: 'My custom message',
  password: 'Invalid password'
}

//Creaging a form.
const formInstance = new Formera({
  initialValues: {},
  onSubmit: (formState) => console.log('Submiting: ', formState.values),
  //Passing custom validation messages to formera.
  customValidationMessages: customValidationMessages,
  //Passing custom validation functions to formera.
  customValidators: customValidators,
});

//Subscribing on form state changes.
formInstance.formSubscribe((formState) => {
  console.log('Formstate changes: ', formState);
});

//Creating a field.
const field1 = formInstance.registerField('field1',
  {
    validators: [
      //Default required validator.
      'required',
      //Custom validation function 'password'.
      'password'
    ]
  });

//Subscribing on field changes.
field1.subscribe((fieldState) => {
  console.log('Fieldstate changes: ', fieldState);
});

//After this change your subscription function shoud receive the error 'My custom message' in fieldState.
field1.onChange('');

//After this change your subscription function shoud receive the error 'Invalid password' in fieldState.
field1.onChange('test');

