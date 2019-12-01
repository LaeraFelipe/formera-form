import initializeValidators from '.';
import {getValidatorMessage} from './messages';
import { FieldState } from '../types';

describe('validation base tests', () => {
  it('should return a default required message', () => {
    const validators = initializeValidators();
    const validationResult = validators.required({} as FieldState, {} as any);
    expect(validationResult).toBe(getValidatorMessage('required'));
  });

  it('should return a custom required message', () => {
    const validators = initializeValidators({}, { required: 'The field is required and i am a custom message.' });
    const validationResult = validators.required({} as FieldState, {} as any);
    expect(validationResult).toBe('The field is required and i am a custom message.');
  });

  it('shoud execute a custom validator', () => {
    const customRequired = () => 'Custom validator message';
    const validators = initializeValidators({ required: customRequired });
    const validationResult = validators.required({} as any, {} as any);
    expect(validationResult).toBe('Custom validator message');
  })
})