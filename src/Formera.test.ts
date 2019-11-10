import Formera from ".";

const formeraInstance = new Formera({
  debug: false,
  initialValues: { third: 'Initial value' },
  onSubmit: (values) => console.log('submit', values)
});


describe('formera base tests', () => {
  it('testing subscriptions', () => {
    const input = formeraInstance.registerField('first');

    formeraInstance.fieldSubscribe(input.name, ({ value, meta }) => {
      expect(value).toBe('changedValue');
      expect(meta.pristine).toBe(false);
    });


    formeraInstance.formSubscribe(({ values }) => {
      expect(values).toStrictEqual({ first: 'changedValue', third: 'Initial value' });
    })

    input.onChange('changedValue');
  });

  it('testing validators', () => {
    const secondInput = formeraInstance.registerField('second', { validators: ['required'] });

    formeraInstance.fieldSubscribe(secondInput.name, ({ meta }) => {
      expect(meta.valid).toBe(false);
    }, { valid: true });

    const thirdInput = formeraInstance.registerField('third', { validators: ['required'] });

    formeraInstance.fieldSubscribe(thirdInput.name, ({ meta }) => {
      expect(meta.valid).toBe(true);
    }, { valid: true });
  });
})