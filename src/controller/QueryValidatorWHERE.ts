import {validateArray, validateObject} from "./utils";
import {
	FILTER, validateMFIELD, validateSFIELD
} from "./IQueryValidator";
import {InsightDatasetKind} from "./IInsightFacade";


export class QueryValidatorWHERE {
	private _datasetId: string;
	private _datasetKind: InsightDatasetKind;
	constructor(datasetId: string, datasetKind: InsightDatasetKind) {
		this._datasetId = datasetId;
		this._datasetKind = datasetKind;
	}

	public validateWHERE(queryBody: any) {
		validateObject(queryBody, "WHERE body is invalid");
		const keys = Object.keys(queryBody);
		if (keys.length > 1) {
			throw new Error("Too many filters in WHERE");
		}
		if (keys.length === 0) {
			return;
		}
		this.validateFilter(keys[0] as FILTER, queryBody[keys[0]]);
	}

	private validateFilter(filterKey: FILTER, filterValue: any) {
		validateObject(filterValue, `${filterKey} in the FILTER is invalid`);
		switch (filterKey) {
			case FILTER.EQ:
			case FILTER.GT:
			case FILTER.LT:
				this.validateMCOMPARISON(filterValue);
				break;
			case FILTER.AND:
			case FILTER.OR:
				this.validateLOGICCOMPARISON(filterValue);
				break;
			case FILTER.NOT:
				this.validateNEGATION(filterValue);
				break;
			case FILTER.IS:
				this.validateSCOMPARISON(filterValue);
				break;
			default:
				throw new Error("Invalid Filter type");
		}
	}

	private validateMCOMPARISON(filterValue: any) {
		validateObject(filterValue, "MCOMPARISON value is not an object");
		let keys = Object.keys(filterValue);
		if (keys.length !== 1) {
			throw new Error("MCOMPARISON filter has incorrect number of keys");
		}
		let mkey = keys[0];
		let mkeyID = mkey.split("_")[0];
		let mkeyField = mkey.split("_")[1];
		if (!validateMFIELD(mkeyField, this._datasetKind) ||
			mkeyID !== this._datasetId
		) {
			throw new Error("MCOMPARISON Bad field in mkey");
		}
		if (!(typeof filterValue[mkey] === "number")) {
			throw new Error("Invalid value type in MCOMPARISON, should be number");
		}
	}

	private validateSCOMPARISON(filterValue: any) {
		validateObject(filterValue, "SCOMPARISON value is not an object");
		let keys = Object.keys(filterValue);
		if (keys.length !== 1) {
			throw new Error("SCOMPARISON filter has incorrect number of keys");
		}
		let skey = keys[0];
		let skeyID = skey.split("_")[0];
		let skeyField = skey.split("_")[1];
		let skeyValue = filterValue[skey];
		if (!validateSFIELD(skeyField, this._datasetKind) ||
			skeyID !== this._datasetId
		) {
			throw new Error("SCOMPARISON Bad field in mkey");
		}
		if (!(typeof skeyValue === "string")) {
			throw new Error("Invalid value type in SCOMPARISON, should be string");
		}
		skeyValue = skeyValue.startsWith("*") ? skeyValue.substring(1, skeyValue.length) : skeyValue;
		skeyValue = skeyValue.endsWith("*") ? skeyValue.substring(0, skeyValue.length - 1) : skeyValue;
		if (skeyValue.includes("*")) {
			throw new Error("Asterisks (*) can only be the first or last characters of input strings");
		}
	}

	private validateNEGATION(filterValue: any) {
		validateObject(filterValue, "Negation value is not an object");
		let keys = Object.keys(filterValue);
		if (keys.length !== 1) {
			throw new Error("Negation comparison filter has incorrect number of many arguments");
		}
		this.validateFilter(keys[0] as FILTER, filterValue[keys[0]]);
	}

	private validateLOGICCOMPARISON(filterArray: any) {
		validateArray(filterArray, "Logic Comparison did not receive array as input");
		if (filterArray.length < 1) {
			throw new Error("Logic Comparison is empty");
		}

		for (const filter of filterArray) {
			let keys = Object.keys(filter);
			if (keys.length !== 1) {
				throw new Error("Logic comparison filter has incorrect number of arguments");
			}
			this.validateFilter(keys[0] as FILTER, filter[keys[0]]);
		}
	}
}
