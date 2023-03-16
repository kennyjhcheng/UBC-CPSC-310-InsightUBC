// union types: https://dev.to/hansott/how-to-check-if-string-is-member-of-union-type-1j4m
import {InsightDatasetKind} from "./IInsightFacade";

export const MFIELD_SECTIONS = [
	"avg",
	"pass",
	"fail",
	"audit",
	"year",
];

export type MfieldTupleSections = typeof MFIELD_SECTIONS;
export type MfieldSections = MfieldTupleSections[number];

export const SFIELD_SECTIONS = [
	"dept",
	"id",
	"instructor",
	"title",
	"uuid",
];
export type SfieldTupleSections = typeof SFIELD_SECTIONS;
export type SfieldSections = SfieldTupleSections[number];

export const MFIELD_ROOMS = [
	"lat",
	"lon",
	"seats"
];

export type MfieldTupleRooms = typeof MFIELD_ROOMS;
export type MfieldRooms = MfieldTupleRooms[number];

export const SFIELD_ROOMS = [
	"fullname",
	"shortname",
	"number",
	"name",
	"address",
	"type",
	"furniture",
	"href"
];
export type SfieldTupleRooms = typeof SFIELD_ROOMS;
export type SfieldRooms = SfieldTupleRooms[number];

export function validateMFIELD(field: string, kind: InsightDatasetKind): boolean {
	return kind === InsightDatasetKind.Sections ?
		MFIELD_SECTIONS.includes(field as MfieldSections) : MFIELD_ROOMS.includes(field as MfieldRooms);
}

export function validateSFIELD(field: string, kind: InsightDatasetKind): boolean {
	return kind === InsightDatasetKind.Sections ?
		SFIELD_SECTIONS.includes(field as SfieldSections) : SFIELD_ROOMS.includes(field as SfieldRooms);
}

export const DIRECTION = [
	"UP",
	"DOWN"
];
export type DirectionTuple = typeof DIRECTION;
export type Direction = DirectionTuple[number];

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

