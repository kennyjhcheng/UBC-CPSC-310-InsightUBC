import {ISection} from "./Datasets/ISection";
import {IRoom} from "./Datasets/IRoom";
import Decimal from "decimal.js";
import {InsightResult} from "./IInsightFacade";
import {APPLYTOKEN} from "./IQueryValidator";

export interface IGroups {
	[groupKey: string]: ISection[] | IRoom[]
}

export function groupData(filteredResults: ISection[] | IRoom[], keys: string[]) {
	let results: IGroups = {};
	for (let data of filteredResults) {
		const groupKey = generateGroupName(data, keys);
		if (!results[groupKey]) {
			results[groupKey] = [];
		}
		results[groupKey].push(data as ISection & IRoom);
	}
	return results;
}

function generateGroupName(data: any, keys: string[]) {
	let groupKey = "";
	keys.forEach((key) => {
		groupKey += data[extractField(key)];
	});
	return groupKey;
}

export function extractField (key: string){
	const split = key.split("_");
	return split.length === 2 ? split[1] : "";
}

export function applyGroupFunctions(groupedData: IGroups, columns: string[], applyRules: any): InsightResult[] {
	let result: InsightResult[] = [];
	for (let dataGroup of Object.values(groupedData)) {
		let insightResult: InsightResult = {};
		for (let column of columns) {
			if (column.includes("_")) {
				insightResult[column] = dataGroup[0][extractField(column) as keyof (ISection|IRoom)];
			} else {
				for (let rule of applyRules) {
					const applyKey = Object.keys(rule)[0];
					if (column === applyKey) {
						insightResult[column] = executeApply(dataGroup, rule[applyKey]);
					}
				}
			}
		}
		result.push(insightResult);
	}
	return result;
}

function computeCount(dataGroup: ISection[] | IRoom[], field: string) {
	const items = new Set(dataGroup.map((data) => data[field as keyof  (ISection|IRoom)]));
	return items.size;
}

function computeMax(dataGroup: ISection[] | IRoom[], field: string) {
	let max = dataGroup[0][field as keyof (ISection|IRoom)];;
	dataGroup.forEach((data) => {
		if(data[field as keyof (ISection| IRoom)] >= max){
			max = data[field as keyof (ISection | IRoom)];
		}
	});
	return max;
}

function computeMin(dataGroup: ISection[] | IRoom[], field: string) {
	let min = dataGroup[0][field as keyof (ISection|IRoom)];
	dataGroup.forEach((data) => {
		if(data[field as keyof (ISection| IRoom)] < min){
			min = data[field as keyof (ISection | IRoom)];
		}
	});
	return min;
}

function computeAvg(dataGroup: ISection[] | IRoom[], field: string): number {
	let total: Decimal = new Decimal(0);
	let length = dataGroup.length;
	dataGroup.forEach((data) => {
		let num = data[field as keyof (ISection | IRoom)] as number;
		total = total.add(new Decimal(num));
	});
	return Number((total.toNumber() / length).toFixed(2));
}

function computeSum(dataGroup: ISection[] | IRoom[], field: string) {
	let total = 0;
	dataGroup.forEach((data) => {
		total += data[field as keyof (ISection | IRoom)] as number;
	});
	return Number(total.toFixed(2));
}

export function executeApply(dataGroup: ISection[] | IRoom[], tokenObject: any): number {
	const token = Object.keys(tokenObject)[0];
	const field = extractField((Object.values(tokenObject)[0]) as string);
	if (!dataGroup.length) {
		return -1;
	}
	switch (token as APPLYTOKEN){
		case APPLYTOKEN.COUNT:
			return computeCount(dataGroup, field);
		case APPLYTOKEN.MAX:
			return computeMax(dataGroup, field);
		case APPLYTOKEN.AVG:
			return computeAvg(dataGroup, field);
		case APPLYTOKEN.MIN:
			return computeMin(dataGroup, field);
		case APPLYTOKEN.SUM:
			return computeSum(dataGroup, field);
		default:
			return -1;
	}
}

