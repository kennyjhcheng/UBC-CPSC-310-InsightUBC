import {validateArray, validateObject} from "./utils";
import {FILTER, Mfield, MFIELD, SFIELD, Sfield} from "./IQueryValidator";

export class QueryValidator {
	private _datasetId?: string;

	/**
	 * Validates that query
	 * @param query
	 */
	public validateQuery(query: any) {
		if (!validateObject(query)) {
			throw new Error("Query does not exist or isn't an object");
		}

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
		const keys = Object.keys(queryBody);

		// TODO: in reference UI, you can have multiple query keys, but EBNF shouldn't allow this
		// There should only be one key in WHERE right?
		//	* reference UI: https://cs310.students.cs.ubc.ca/ui/index.html
		//  * EBNF: https://sites.google.com/view/ubc-cpsc310-22w2/project/c0?authuser=0#h.rckgz9kv4rhk:~:text=BODY%20%3A%3A%3D%20%27WHERE%3A%7B%27%20FILTER%3F%20%27%7D%27
		if (keys.length > 1) {
			throw new Error();
		}
		if (keys.length === 0) {
			return;
		}
		this.validateFilter(keys[0] as FILTER, queryBody[keys[0]]);
	}

	/**
	 * Validates the filter from WHERE
	 * @param filter
	 * @private
	 */
	private validateFilter(filter: FILTER, filterBody: any) {
		switch (filter) {
			case FILTER.EQ:
			case FILTER.GT:
			case FILTER.LT:
				this.validateMCOMPARISON(filterBody);
				break;
			case FILTER.AND:
			case FILTER.OR:
				this.validateLOGICCOMPARISON(filterBody);
			case FILTER.NOT:
				this.validateNEGATION(filterBody);
			case FILTER.SCOMPARATOR:
				this.validateSCOMPARISON(filterBody);
			default:
				throw new Error("Invalid Filter type");
		}
	}

	private validateMCOMPARISON(filterBody: any) {
		return;
	}

	private validateSCOMPARISON(filterBody: any) {
		return;
	}

	private validateNEGATION(filterBody: any) {
		return;
	}

	private validateLOGICCOMPARISON(filterBody: any) {
		return;
	}

	/**
	 * Validates the COLUMNS section of query
	 * @param columns
	 * @private
	 */
	private validateCOLUMNS(columns: any) {
		if (!validateArray(columns)) {
			throw new Error("COLUMNS value is missing");
		}
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
