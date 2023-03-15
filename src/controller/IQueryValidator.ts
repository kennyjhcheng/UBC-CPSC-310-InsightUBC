// union types: https://dev.to/hansott/how-to-check-if-string-is-member-of-union-type-1j4m
export const MFIELD = [
	"avg",
	"pass",
	"fail",
	"audit",
	"year",
	"lat",
	"lon",
	"seats"
];

export type MfieldTuple = typeof MFIELD;
export type Mfield = MfieldTuple[number];

export const SFIELD = [
	"dept",
	"id",
	"instructor",
	"title",
	"uuid",
	"fullname",
	"shortname",
	"number",
	"name",
	"address",
	"type",
	"furniture",
	"href"
];
export type SfieldTuple = typeof SFIELD;
export type Sfield = SfieldTuple[number];

export enum FILTER {
	AND = "AND",
	OR = "OR",
	LT = "LT",
	GT = "GT",
	EQ = "EQ",
	IS = "IS",
	NOT = "NOT",
}

export enum APPLYTOKEN {
	MAX = "MAX",
	MIN = "MIN",
	AVG = "AVG",
	COUNT = "COUNT",
	SUM = "SUM"
}

