import {DIRECTION, Direction, FILTER} from "./IQueryValidator";
import {ISection} from "./Datasets/ISection";
import {InsightResult} from "./IInsightFacade";
import {IDataset} from "./Datasets/IDataset";
import {applyGroupFunctions, groupData} from "./QueryTransformer";


export class QueryExecutor {
	private _dataset: ISection[];

	constructor(dataSet: IDataset) {
		// TODO: when implementing perform query, remove type assertion
		this._dataset = dataSet.data as ISection[];
	}

	/**
	 * Executes that query
	 * @param query
	 */
	public executeQuery(query: any): InsightResult[] {
		if(query["TRANSFORMATIONS"]){
			let groupedData = groupData(this.executeWHERE(query["WHERE"]),query["TRANSFORMATIONS"]["GROUP"]);
			return applyGroupFunctions(groupedData,query["OPTIONS"]["COLUMNS"],query["TRANSFORMATIONS"]["APPLY"]);
		}
		// The below code needs to be different
		let unorderedResult = this.executeCOLUMNS(query["OPTIONS"]["COLUMNS"], this.executeWHERE(query["WHERE"]));
		if (query["OPTIONS"]["ORDER"]) {
			let ORDER = query["OPTIONS"]["ORDER"];
			return this.orderResult(unorderedResult, ORDER);
		}
		return unorderedResult;
	}

	private orderResult(unorderedResult: InsightResult[], ORDER: any): InsightResult[] {
		let orderKeys = Object.keys(ORDER);
		if (orderKeys.length === 0) {
			return unorderedResult.sort((a, b) => this.sortUP(a, b, ORDER));
		}

		let keys: string[] = ORDER["keys"];
		let sortFn = (a: InsightResult, b: InsightResult, key: string) => ORDER["dir"] as Direction === "UP" ?
			this.sortUP(a, b, key) :
			this.sortUP(b, a, key);

		return unorderedResult.sort((a, b) => {
			keys.forEach((key) => {
				let comparison = sortFn(a, b, key);
				if (comparison !== 0) {
					return comparison;
				}
			});
			return 0;
		});

	}

	/**
	 * To sortUp, call this.sort(a, b, key)
	 * To sortDown, call this.sort(b, a, key)
	 */
	private sortUP(a: InsightResult, b: InsightResult, key: string) {
		return (a[key] > b[key]) ?
			1 :
			((b[key] > a[key]) ?
				-1 :
				0
			);
	}

	/**
	 * executes the WHERE section of the query, the query body
	 * @param queryBody
	 * @private
	 */
	private executeWHERE(queryBody: any): ISection[] {
		const keys = Object.keys(queryBody);
		if (keys.length === 0) {
			return this._dataset;
		}
		return this.executeFilter(keys[0] as FILTER, queryBody[keys[0]]);
	}

	/**
	 * executes the filter from WHERE
	 * @param filterKey
	 * @param filterValue
	 * @private
	 */
	private executeFilter(filterKey: FILTER, filterValue: any): ISection[] {
		switch (filterKey) {
			case FILTER.EQ:
			case FILTER.GT:
			case FILTER.LT:
				return this.executeMCOMPARISON(filterKey, filterValue);
			case FILTER.AND:
				return this.executeAND(filterValue);
			case FILTER.OR:
				return this.executeOR(filterValue);
			case FILTER.NOT:
				return this.executeNEGATION(filterValue);
			case FILTER.IS:
				return this.executeSCOMPARISON(filterValue);
		}
	}

	private executeMCOMPARISON(filterKey: FILTER, filterValue: any): ISection[] {
		let keys = Object.keys(filterValue);
		let mkey = keys[0];
		let mkeyField = mkey.split("_")[1];
		let value = filterValue[mkey];
		switch (filterKey) {
			case FILTER.EQ:
				return this._dataset.filter((section) => {
					return section[mkeyField as keyof ISection] === value;
				});
			case FILTER.GT:
				return this._dataset.filter((section) => {
					return section[mkeyField as keyof ISection] > value;
				});
			case FILTER.LT:
				return this._dataset.filter((section) => {
					return section[mkeyField as keyof ISection] < value;
				});
		}
		return [];
	}

	private executeSCOMPARISON(filterValue: any): ISection[] {
		let keys = Object.keys(filterValue);
		let skey = keys[0];
		let skeyField = skey.split("_")[1];
		let skeyValue = filterValue[skey];
		if (skeyValue.startsWith("*") && skeyValue.endsWith("*")) {
			let value = skeyValue.substring(1, skeyValue.length - 1);
			if (value === "*") {
				return this._dataset;
			}
			return this._dataset.filter((section) => {
				return (section[skeyField as keyof ISection] as string).includes(value);
			});
		}
		if (skeyValue.startsWith("*")) {
			let value = skeyValue.substring(1);
			return this._dataset.filter((section) => {
				return (section[skeyField as keyof ISection] as string).endsWith(value);
			});
		}
		if (skeyValue.endsWith("*")) {
			let value = skeyValue.substring(0, skeyValue.length - 1);
			return this._dataset.filter((section) => {
				return (section[skeyField as keyof ISection] as string).startsWith(value);
			});
		}
		return this._dataset.filter((section) => {
			return (section[skeyField as keyof ISection] as string) === skeyValue;
		});
	}

	private executeNEGATION(filterValue: any): ISection[] {
		let keys = Object.keys(filterValue);
		let temp: ISection[] = this.executeFilter(keys[0] as FILTER, filterValue[keys[0]]);
		return this._dataset.filter((section) => !temp.includes(section));
	}

	private executeAND(filterArray: any): ISection[] {
		let result: ISection[] = [];
		(filterArray as FILTER[]).forEach((filter: any, index) => {
			let keys = Object.keys(filter);
			let newFilter = this.executeFilter(keys[0] as FILTER, filter[keys[0]]);
			if (index === 0) {
				result = this.executeFilter(keys[0] as FILTER, filter[keys[0]]);
			} else {
				result = result.filter((section) => newFilter.includes(section));
			}
		});
		return result;
	}

	private executeOR(filterArray: any): ISection[] {
		let result: ISection[] = [];
		for (const filter of filterArray) {
			let keys = Object.keys(filter);
			let newList: ISection[] = this.executeFilter(keys[0] as FILTER, filter[keys[0]]);
			// https://stackoverflow.com/questions/3629817/getting-a-union-of-two-arrays-in-javascript
			result = [...new Set([...result, ...newList])];
		}
		return result;
	}

	/**
	 * executes the COLUMNS section of query
	 * @param columns
	 * @private
	 */
	private executeCOLUMNS(columns: any, data: ISection[]): InsightResult[] {
		let datasetId = columns[0].split("_")[0];
		let columnsNeeded: string[] = [];
		for (const column of columns) {
			let key = column.split("_");
			columnsNeeded.push(key[1]);
		}
		let result: InsightResult[] = [];
		data.forEach((section) => {
			// https://stackoverflow.com/questions/38750705/filter-object-properties-by-key-in-es6
			const filtered = Object.keys(section)
				.filter((key) => columnsNeeded.includes(key))
				.reduce((obj, key) => {
					obj[datasetId + "_" + key] = section[key as keyof ISection];
					return obj;
				}, {} as InsightResult);
			result.push(filtered);
		});
		return result;
	}
}
