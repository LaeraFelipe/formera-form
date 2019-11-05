import { isEqual } from 'lodash';

/**Get the value received in change event. */
function getChangeValue(value: any) {
	if (value.target) {
		return value.target.value;
	} else {
		return value;
	}
}

/**Get state changes. */
function getStateChanges(state: any): Array<string> {
	const { previousState } = state;

	let changes = [];

	for (const key in state) {
		if (['previousState'].indexOf(key) > -1) continue;

		if (typeof state[key] === "object") {
			if (!isEqual(previousState[key], state[key])) {
				changes.push(key);
			}
		} else {
			if (previousState[key] !== state[key]) {
				changes.push(key);
			}
		}
	}

	return changes;
}

export {
	getChangeValue,
	getStateChanges
}