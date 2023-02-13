// juggling check for null + undefined: https://stackoverflow.com/questions/28975896/is-there-a-way-to-check-for-both-null-and-undefined
export function validateArray(obj: any, err: string) {
	if (!(obj != null && typeof obj === "object" && Array.isArray(obj))) {
		throw new Error(err);
	}
}

export function validateObject(obj: any, err: string) {
	if (!(obj != null && typeof obj === "object")) {
		throw new Error(err);
	}
}

// https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
export function arraysEqual(a: any, b: any) {
	if (a === b) {
		return true;
	}
	if (a == null || b == null) {
		return false;
	}
	if (a.length !== b.length) {
		return false;
	}

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}
