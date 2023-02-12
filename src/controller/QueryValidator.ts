import {validateArray, validateObject} from "./utils";
import {FILTER, Mfield, MFIELD, SFIELD, Sfield} from "./IQueryValidator";

export class QueryValidator {
	private _datasetId?: string;

	/**
	 * Validates that query
	 * @param query
	 */
	public validateQuery(query: any) {
		validateObject(query, "Query does not exist or isn't an object");

		// cannot check property existence of unknowns by referencing property directly
		const queryKeys = Object.keys(query as object);
		if (queryKeys.length >= 3) {
			throw new Error("Query has too many keys");
		}
		if (!queryKeys.includes("WHERE")) {
			throw new Error("Query is missing WHERE");
		}
		this.validateWHERE(query["WHERE"]);

		// Validate OPTIONS property
		if (!queryKeys.includes("OPTIONS")) {
			throw new Error("Query is missing OPTIONS");
		}
		const optionKeys = Object.keys(query["OPTIONS"]);
		if (!optionKeys.includes("COLUMNS")) {
			throw new Error("OPTIONS is missing COLUMNS");
		}

		this.validateCOLUMNS(query["OPTIONS"]["COLUMNS"]);
		if (optionKeys.includes("ORDER") && !query["OPTIONS"]["COLUMNS"].includes(query["OPTIONS"]["ORDER"])) {
			throw new Error("ORDER key must be in COLUMNS");
		}

	}

	/**
	 * validates the WHERE section of the query, the query body
	 * @param queryBody
	 * @private
	 */
	private validateWHERE(queryBody: any) {
		validateObject(queryBody, "WHERE body is invalid");
		const keys = Object.keys(queryBody);

		// TODO: in reference UI, you can have multiple query keys, but EBNF shouldn't allow this
		// There should only be one key in WHERE right?
		//	* reference UI: https://cs310.students.cs.ubc.ca/ui/index.html
		//  * EBNF: https://sites.google.com/view/ubc-cpsc310-22w2/project/c0?authuser=0#h.rckgz9kv4rhk:~:text=BODY%20%3A%3A%3D%20%27WHERE%3A%7B%27%20FILTER%3F%20%27%7D%27
		if (keys.length > 1) {
			throw new Error("Too many filters in WHERE");
		}
		if (keys.length === 0) {
			return;
		}
		this.validateFilter(keys[0] as FILTER, queryBody[keys[0]]);
	}

	/**
	 * Validates the filter from WHERE
	 * @param filterKey
	 * @private
	 */
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
		if (!MFIELD.includes(mkeyField as Mfield) ||
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
		if (!SFIELD.includes(skeyField as Sfield) ||
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

	/**
	 * Validates the COLUMNS section of query
	 * @param columns
	 * @private
	 */
	private validateCOLUMNS(columns: any) {
		validateArray(columns, "COLUMNS value is missing");
		if (columns.length < 1) {
			throw new Error("COLUMNS is empty");
		}
		let datasetId = columns[0].split("_")[0];
		for (const column of columns) {
			let key = column.split("_");
			if (key[0] !== datasetId) {
				throw new Error("COLUMNS: Cannot query more than one dataset");
			}
			if (!(MFIELD.includes(key[1] as Mfield) || SFIELD.includes(key[1] as Sfield))) {
				throw new Error(`Invalid key ${key[1]} in COLUMNS`);
			}
		}
	}

	/**
	 * REQUIRES: query COLUMNS has been validated by running this.validateWHERE_OPTIONS_COLUMNS
	 * @param query
	 */
	public setDatasetId(query: any) {
		this._datasetId = query["OPTIONS"]["COLUMNS"][0].split("_")[0];

	}

	public get datasetId() {
		if (this._datasetId == null) {
			throw Error("datasetId has not been set");
		}
		return this._datasetId;
	}
}