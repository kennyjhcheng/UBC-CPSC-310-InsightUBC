import {validateArray, validateObject} from "./utils";
import {FILTER, Mfield, MFIELD, Sfield, SFIELD} from "./IQueryValidator";
import {ISection} from "./ISection";

export class QueryExecutor {
	private _dataset: ISection[];

	constructor(dataSetID: ISection[]) {
		this._dataset = dataSetID;
	}

    /**
     * Validates that query
     * @param query
     */


	public executeQuery(query: any): ISection[] {
		return this.executeWHERE(query["WHERE"]);
		// this.executeCOLUMNS(query["OPTIONS"]["COLUMNS"]);
	}

    /**
     * validates the WHERE section of the query, the query body
     * @param queryBody
     * @private
     */
	private executeWHERE(queryBody: any): ISection[] {
		const keys = Object.keys(queryBody);
		if(keys.length === 0){
			return this._dataset;
		}
		return this.executeFilter(keys[0] as FILTER, queryBody[keys[0]]);
	}

    /**
     * Validates the filter from WHERE
     * @param filterKey
     * @private
     */
	private executeFilter(filterKey: FILTER, filterValue: any): ISection[] {
		switch (filterKey) {
			case FILTER.EQ:
			case FILTER.GT:
			case FILTER.LT:
				return this.executeMCOMPARISON(filterKey,filterValue);
			case FILTER.AND:
				return this.executeAND(filterValue);
			case FILTER.OR:
				return this.executeOR(filterValue);
			case FILTER.NOT:
				return this.executeNEGATION(filterValue);
			case FILTER.IS:
				return this.executeSCOMPARISON(filterValue);
			default:
				return [];
		}
	}

	private executeMCOMPARISON(filterKeY: FILTER, filterValue: any): ISection[] {
		let keys = Object.keys(filterValue);
		let mkey = keys[0];
		let mkeyField = mkey.split("_")[1];
		let value = filterValue[mkey];
		let result: ISection[] = [];
		this._dataset?.forEach((section) => {
			switch (filterKeY) {
				case FILTER.EQ:
					if(section[mkeyField as keyof ISection] === value){
						result.push(section);
					}
					break;
				case FILTER.GT:
					if(section[mkeyField as keyof ISection] > value){
						result.push(section);
					}
					break;
				case FILTER.LT:
					if(section[mkeyField as keyof ISection] < value){
						result.push(section);
					}
					break;
			}
		});
		return result;
	}

	private executeSCOMPARISON(filterValue: any): ISection[] {
		return [];
	}

	private executeNEGATION(filterValue: any): ISection[] {
		validateObject(filterValue, "Negation value is not an object");
		let keys = Object.keys(filterValue);
		if (keys.length !== 1) {
			throw new Error("Negation comparison filter has incorrect number of many arguments");
		}
		this.executeFilter(keys[0] as FILTER, filterValue[keys[0]]);
		return [];
	}

	private executeAND(filterArray: any): ISection[] {
		let result: ISection[] = [];
		(filterArray as FILTER[]).forEach((filter: any, index) => {
			let keys = Object.keys(filter);
			let newFilter = this.executeFilter(keys[0] as FILTER, filter[keys[0]]);
			if(index === 0){
				result = this.executeFilter(keys[0] as FILTER, filter[keys[0]]);
			} else{
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
     * Validates the COLUMNS section of query
     * @param columns
     * @private
     */
	private executeCOLUMNS(columns: any) {
		return;
	}
}
