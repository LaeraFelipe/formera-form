
# Formera

Formera is a typescript form lib focused on high performance and participle. All its functionalities were developed aiming at the smallest size and smallest impact on performace.

## Getting Started

These instructions will help you to get and use formera on your app.

### Prerequisites

Formera has no dependencies. All its features were developed internally.

### Installing

```
npm install --save formera-form@latest
```

### Using

Basically all you need to do is create a form, register your fields and change values.

```js
import Formera from 'formera-form';

//Creaging a form.
const formInstance = new Formera({
  initialValues: {},
  allowInvalidSubmit: true,
  onSubmit: (formState) => console.log('Submiting: ', formState.values)
});

//Subscribing on form state changes.
formInstance.formSubscribe((formState) => {
  console.log('Formstate changes: ', formState);
});

//Creating a field.
const field1 = formInstance.registerField('field1');
//Subscribing on field changes.
field1.subscribe((fieldState) => {
  console.log('Fieldstate changes: ', fieldState;
});

field1.onChange('test');
```

#### Validation

Formera can do validation on fields in two ways configured by the option <b>validationType</b>. And this can be specified in options passed to the Formera constructor and overrided in field register options if you want. The two accepted values are "onBlur" or "onChange". 

```js
//In Formera constructor.
const formInstance = new Formera({
  validationType: 'onBlur'
});

//Or in field register options.
const field1 = formInstance.registerField('field1', { validationType: 'onChange' });
```

To tell the field the validators that he have to use, you have to pass an array with the validators names or literal objects(detailed <a href="http://www.laerasoftware.com/formera-form-react/interfaces/fieldvalidator.html">here</a>) that you want.

```js
//Or in field register options.
const field1 = formInstance.registerField('field1', { validationType: 'onChange', validators: ['required'] });
```

You can set a source of validation functions and validation messages in formera this way:

```js
//Creating custom validation functions to formera.
const customValidators = {
  //Creating a new validator.
  password: function (fieldState, formValues, params) {
    if (!fieldState.value || fieldState.value.length < 8) {
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

//Creaging a form with custom validation functions and messages.
const formInstance = new Formera({
  initialValues: {},
  onSubmit: (formState) => console.log('Submiting: ', formState.values),
  //Passing custom validation messages to formera.
  customValidationMessages: customValidationMessages,
  //Passing custom validation functions to formera.
  customValidators: customValidators,
});

const field1 = formInstance.registerField('field1',
  {
    validators: [
      //Default required validator.
      'required',
      //Custom validation function 'password'.
      'password',
      //Default validator maxLength.
      {
        name: 'maxLength',
        params: [20]
      }
    ]
  }
);
```

If you want to use the same validators in other forms, you can export <b>customValidators</b> and <b>customValidationMessages</b> in other file and use in everywhere you want.

If you want to use a validator in a single form you can create it in the same file and use in your fields.

```js

const myLocalValidator = {
  name: 'myCustomValidator',
  func: function({ value }) {
    //Do your validation here...
  }
}

const field1 = formInstance.registerField('field1', { validators: [ 'required', myLocalValidator ] });

```

Sometimes validation functions can be expensive, so in formera you can set a debounce time to execute a function to avoid the performance lost.

```js

const myExpensiveValidator = {
  name: 'myExpensiveValidator',
  debounce: 500,
  func: async function({ value }) {
    //My expensive code.
  }
}

const field1 = formInstance.registerField('field1', { validators: [ 'required', myExpensiveValidator ] });

```

### Demo

[formera-form demo](https://codesandbox.io/embed/agitated-river-vlykg?fontsize=14&hidenavigation=1&theme=dark).
 
## Documentation

The full documentation can be found at [formera-form](http://www.laerasoftware.com/formera-form/).

## Authors

*  **Felipe Laera** - *Software Engineer*

See also the list of [contributors](https://github.com/LaeraFelipe/formera-form/contributors) who participated in this project.
  

## License


This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/LaeraFelipe/formera-form/blob/master/LICENSE.md) file for details
  