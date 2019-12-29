import Formera from ".";
import { getValidatorMessage } from "./validation/messages";

const initialValue = {
  field1: 'test',
  field2: 'test',
  field3: [
    {
      field4: 'test',
      field5: ''
    }
  ]
}

describe('formera base tests', () => {
  it('testing subscriptions', () => {
    const subscriptionFormeraInstance = new Formera({
      debug: false,
      initialValues: initialValue,
      onSubmit: (values) => console.log('submit', values)
    });

    const field1 = subscriptionFormeraInstance.registerField('field1');

    subscriptionFormeraInstance.fieldSubscribe('field1', ({ value, pristine }) => {
      expect(value).toBe('changedValue');
      expect(pristine).toBe(false);
    });

    subscriptionFormeraInstance.formSubscribe(({ values }) => {
      expect(values).toStrictEqual({ ...initialValue, field1: 'changedValue' });
    })

    field1.onChange('changedValue');
  });

  it('testing validators', done => {
    const validatorFormeraInstance = new Formera({
      debug: false,
      initialValues: initialValue,
      onSubmit: (values) => console.log('submit', values)
    });

    const field1 = validatorFormeraInstance.registerField('field1', { validators: ['required'] });

    expect.assertions(3);

    validatorFormeraInstance.fieldSubscribe('field1', ({ value, pristine, valid }) => {
      if (!valid) {
        expect(value).toBe('');
        expect(pristine).toBe(false);
        expect(valid).toBe(false);
        done();
      }

    }, { valid: true });

    field1.onChange('');
  });

  it('testing multiple validators', done => {
    const multipleValidatorFormeraInstance = new Formera({
      debug: false,
      initialValues: initialValue,
      onSubmit: (values) => console.log('submit', values)
    });

    const field1 = multipleValidatorFormeraInstance
      .registerField('multipleValidatorField', { validators: ['required', 'email'] });

    expect.assertions(6);

    multipleValidatorFormeraInstance.fieldSubscribe('multipleValidatorField', ({ value, valid, error }) => {
      if (error && !valid) {
        expect(value).toBe('aaaa');
        expect(valid).toBe(false);
        expect(error).toBe(getValidatorMessage('email'));
        done();
      }
    }, { valid: true, value: true, error: true });

    field1.onChange('aaaa');
  });

  it('testing nested updates', done => {
    const nestedUpdateFormeraInstance = new Formera({
      debug: false,
      initialValues: initialValue,
      onSubmit: (values) => console.log('submit', values)
    });

    nestedUpdateFormeraInstance.registerField('field1', { validators: ['required'] });
    nestedUpdateFormeraInstance.registerField('field2', { validators: ['required'] });
    const field3 = nestedUpdateFormeraInstance.registerField('field3', { validators: ['required'] });
    const field4 = nestedUpdateFormeraInstance.registerField('field3[0].field4', { validators: ['required'] });
    const field5 = nestedUpdateFormeraInstance.registerField('field3[0].field5', { validators: ['required'] });

    let field4notify = false;

    field4.subscribe(({ valid }) => {
      if (!valid) {
        field4notify = true;
      }
    }, { valid: true });

    field5.subscribe(({ valid }) => {
      if (valid && field4notify) {
        done();
      }
    }, { valid: true });

    field3.onChange([{
      field4: '',
      field5: 'test'
    }]);
  })

  it('testing submit', done => {
    const submitFormeraInstance = new Formera({
      debug: false,
      initialValues: initialValue,
      onSubmit: (values) => console.log('submit', values)
    });

    submitFormeraInstance.registerField('field1', { validators: ['required'] });
    submitFormeraInstance.registerField('field2', { validators: ['required'] });
    submitFormeraInstance.registerField('field3', { validators: ['required'] });
    submitFormeraInstance.registerField('field3.field4', { validators: ['required'] });
    submitFormeraInstance.registerField('field3.field5', { validators: ['required'] });


    submitFormeraInstance.submit()
      .then(() => {
        expect(submitFormeraInstance.getFieldState('field1').touched).toBe(true);
        expect(submitFormeraInstance.getFieldState('field2').touched).toBe(true);
        expect(submitFormeraInstance.getFieldState('field3').touched).toBe(true);
        expect(submitFormeraInstance.getFieldState('field3.field4').touched).toBe(true);
        expect(submitFormeraInstance.getFieldState('field3.field5').touched).toBe(true);

        done();
      });
  })
})