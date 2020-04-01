import Formera from '../dist/Formera';

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
  console.log('Fieldstate changes: ', fieldState);
});

field1.onChange('test');

async function consultaCodigoBarra(produtos) {
  let result = [];
  for (const produto of produtos) {
    const resultadoConsulta = await suaFuncaoDeConsultarCodigo(produto.id);
    result.push({ id: produto.id, codigoBarras: resultadoConsulta });
  }
  return result;
}

consultaCodigoBarra.then(resultado => console.log(resultado));
