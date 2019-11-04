import { FormState } from "../types";

/**Set form state. */
export function setState(state: FormState, path: { [key in keyof Omit<FormState, 'previousState' | 'values' | 'initialValues'>]: any }) {

}