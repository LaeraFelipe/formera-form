import isEqual from "./isEqual";
import clone from "./clone";
import set from "./set";
import get from "./get";
import { State } from "../types";

/**Returns just a first path of a key */
export function getChangedKey(key: string): string {
	const dotIndex = key.indexOf('.');
	if (dotIndex > -1) {
		return key.slice(0, dotIndex);
	}
	return key;
}

/**Returns all state changes comparing with previousState. */
export function getStateChanges<T extends State<T>>(state: T): string[] {
	const { previousState, ...currentState } = state;
	let result = [];

	for (const key in currentState) {
		if (!isEqual(currentState[key], previousState[key])) {
			result.push(getChangedKey(key));
		}
	}

	return result;
}

/**Clone a state without clone previousState. */
export function cloneState<T extends State<any>>(state: T): Omit<T, 'previousState'> {
	const { previousState, ...toClone } = state;
	return clone(toClone);
}

/**Set values in state and return an array with changes. */
export function setState<T extends State<T>>(state: T, changes: { [key in keyof T]?: any }): string[] {
	let calculatedChanges: string[] = [];

	for (const key in changes) {
		const previousValue = get(state, key);
		if (!isEqual(previousValue, changes[key])) {
			calculatedChanges.push(getChangedKey(key));
		}
		set(state.previousState, key, clone(previousValue));
		set(state, key, changes[key]);
	}

	return calculatedChanges;
}
