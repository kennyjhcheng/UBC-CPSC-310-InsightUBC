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
