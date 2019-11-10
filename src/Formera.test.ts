import Formera from ".";

const formeraInstance = new Formera({
  debug: true,
  initialValues: {},
  onSubmit: (values) => console.log('submit', values)
});


describe('formera base tests', () => {
  it('executes to correct subscriptions', () => {
    const input = formeraInstance.registerField('first', { validators: ['required'] });

    formeraInstance.fieldSubscribe('first', ({ value, meta }) => {
      expect(value).toBe('changedValue');
      expect(meta.pristine).toBe(false);
    });

    input.onChange('changedValue');
  })
})