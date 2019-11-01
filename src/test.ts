import Form from "./Form";

const form = new Form(
  {
    initialValues: { teste: 'jamanta' },
    debug: true
  }
);

const handler = form.registerField('teste');

