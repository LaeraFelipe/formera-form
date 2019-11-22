import Formera from ".";

const formeraInstance = new Formera({
  debug: false,
  initialValues: { third: 'Initial value' },
  onSubmit: (values) => console.log('submit', values)
});


describe('formera base tests', () => {
  it('testing subscriptions', () => {
    const firstHandler = formeraInstance.registerField('first');

    formeraInstance.fieldSubscribe('first', ({ value, pristine }) => {
      expect(value).toBe('changedValue');
      expect(pristine).toBe(false);
    });

    formeraInstance.formSubscribe(({ values }) => {
      expect(values).toStrictEqual({ first: 'changedValue', third: 'Initial value' });
    })

    firstHandler.onChange('changedValue');
  });

  it('testing validators', () => {
    const secondHandler = formeraInstance.registerField('second', { validators: ['required'] });

    formeraInstance.fieldSubscribe('second', ({ valid }) => {
      expect(valid).toBe(false);
    }, { valid: true });

    const thirdhandler = formeraInstance.registerField('third', { validators: ['required'] });

    formeraInstance.fieldSubscribe('third', ({ valid }) => {
      expect(valid).toBe(true);
    }, { valid: true });
  });

  it('testing submit', () => {
    formeraInstance.submit()
    .then(() => {
     expect(formeraInstance.getFieldState('first').touched).toBe(true);
     expect(formeraInstance.getFieldState('second').touched).toBe(true);
     expect(formeraInstance.getFieldState('third').touched).toBe(true);
    })
  })
})