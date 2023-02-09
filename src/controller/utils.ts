// juggling check for null + undefined: https://stackoverflow.com/questions/28975896/is-there-a-way-to-check-for-both-null-and-undefined
export function validateArray(obj: unknown): boolean {
	return obj != null && typeof obj === "object" && Array.isArray(obj);
}

export function validateObject(obj: unknown): boolean {
	return obj != null && typeof obj === "object";
}
