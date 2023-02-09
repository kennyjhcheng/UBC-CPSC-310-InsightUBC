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
		if (queryKeys.length >= 4) {
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
			case FILTER.NOT:
				this.validateNEGATION(filterValue);
			case FILTER.SCOMPARATOR:
				this.validateSCOMPARISON(filterValue);
			default:
				throw new Error("Invalid Filter type");
		}
	}

	private validateMCOMPARISON(filterValue: any) {

		return;
	}

	private validateSCOMPARISON(filterValue: any) {
		return;
	}

	private validateNEGATION(filterValue: any) {
		return;
	}

	private validateLOGICCOMPARISON(filterArray: any) {
		validateArray(filterArray, "Logic Comparison did not receive array as input");
		if (filterArray.length < 1) {
			throw new Error("Logic Comparison is empty");
		}

		for (const filter of filterArray) {
			let keys = Object.keys(filter);
			if (keys.length > 1) {
				throw new Error("Logic comparison filter has too many arguments");
			}
			if (keys.length !== 0) {
				this.validateFilter(keys[0] as FILTER, filter[keys[0]]);
			}
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
