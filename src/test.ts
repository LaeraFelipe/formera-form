import Form from "./Form";

const form = new Form(
  {
    initialValues: { teste: 'jamanta' },
    debug: true
  }
);

const handler = form.registerField('teste');

handler.onFocus();
handler.onChange('jamanta2');
handler.onChange('jamanta3');
handler.onChange('jamanta4');
handler.onChange('jamanta5');
handler.onBlur();


console.log('----------------------------------------------');

console.log('Formstate', form.getState());
