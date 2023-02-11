import {validateArray, validateObject} from "./utils";
import {FILTER, Mfield, MFIELD, Sfield, SFIELD} from "./IQueryValidator";
import {ISection} from "./ISection";
import InsightFacade from "./InsightFacade";

export class QueryExecutor {
	private _dataset: ISection[];

	constructor(dataSetID: ISection[]) {
		this._dataset = dataSetID;
	}

    /**
     * Executes that query
     * @param query
     */


	public executeQuery(query: any): ISection[] {
		return this.executeWHERE(query["WHERE"]);
		// this.executeCOLUMNS(query["OPTIONS"]["COLUMNS"]);
	}

    /**
     * executes the WHERE section of the query, the query body
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
		// let result: ISection[] = [];
		switch (filterKeY) {
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
		if(skeyValue.startsWith("*") && skeyValue.endsWith("*")){
			let value = skeyValue.substring(1,skeyValue.length - 1);
			return this._dataset.filter((section) => {
				return (section[skeyField as keyof ISection] as string).includes(value);
			});
		}
		if(skeyValue.startsWith("*")){
			let value = skeyValue.substring(1);
			return this._dataset.filter((section) => {
				return (section[skeyField as keyof ISection] as string).endsWith(value);
			});
		}
		if(skeyValue.endsWith("*")){
			let value = skeyValue.substring(0,skeyValue.length - 1);
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
     * executes the COLUMNS section of query
     * @param columns
     * @private
     */
	private executeCOLUMNS(columns: any) {
		return;
	}
}
