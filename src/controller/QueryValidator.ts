import {validateArray, validateObject} from "./utils";
import {
	APPLYTOKEN,
	Direction,
	DIRECTION,
	FILTER, MFIELD_ROOMS,
	MFIELD_SECTIONS, MfieldRooms,
	MfieldSections, SFIELD_ROOMS,
	SFIELD_SECTIONS, SfieldRooms,
	SfieldSections, validateMFIELD, validateSFIELD
} from "./IQueryValidator";
import {IDataset} from "./Datasets/IDataset";
import {InsightDatasetKind} from "./IInsightFacade";
import {QueryValidatorWHERE} from "./QueryValidatorWHERE";

export class QueryValidator {
	private _datasetId?: string;
	private _datasets: Map<string, IDataset>;
	private _dataset_kind?: InsightDatasetKind;
	private transformKeys: string[] = [];

	constructor(datasets: Map<string, IDataset>) {
		this._datasets = datasets;
	}

	public setDatasetId(query: any) {
		try {
			this.extractIdFromColumns(query);
			if (!(this._datasetId && this._dataset_kind)) {
				this.extractIdFromGroups(query);
			}
		} catch (e) {
			throw new Error("Could not set DatasetId");
		}
		if (!(this._datasetId && this._dataset_kind)) {
			throw new Error("Could not set DatasetId");
		}
	}

	private extractIdFromColumns(query: any) {
		for (let col of query["OPTIONS"]["COLUMNS"]) {
			if (col.includes("_")) {
				this._datasetId = col.split("_")[0];
				this._dataset_kind = this._datasets.get(this._datasetId ?? "")?.kind;
				return;
			}
		}
	}

	private extractIdFromGroups(query: any) {
		for (let group of query["TRANSFORMATIONS"]["GROUP"]) {
			if (group.includes("_")) {
				this._datasetId = group.split("_")[0];
				this._dataset_kind = this._datasets.get(this._datasetId ?? "")?.kind;
				return;
			}
		}
	}

	public validateQuery(query: any) {
		validateObject(query, "Query does not exist or isn't an object");
		const queryKeys = Object.keys(query as object);
		if (queryKeys.length > 3) {
			throw new Error("Query has too many keys");
		}
		if (!queryKeys.includes("OPTIONS")) {
			throw new Error("Query is missing OPTIONS");
		}
		const optionKeys = Object.keys(query["OPTIONS"]);
		if (!optionKeys.includes("COLUMNS")) {
			throw new Error("OPTIONS is missing COLUMNS");
		}
		this.validateCOLUMNS(query);
		if (!queryKeys.includes("WHERE")) {
			throw new Error("Query is missing WHERE");
		}
		if (!this._datasetId || !this._dataset_kind) {
			throw new Error("Dataset ID or Dataset kind weren't set when validating");
		}
		let validatorWHERE = new QueryValidatorWHERE(this._datasetId, this._dataset_kind);
		validatorWHERE.validateWHERE(query["WHERE"]);
		if (optionKeys.includes("ORDER")) {
			this.validateORDER(query["OPTIONS"]["COLUMNS"], query["OPTIONS"]["ORDER"]);
		}
		if (!optionKeys.includes("ORDER") && optionKeys.length > 1) {
			throw new Error("invalid key in OPTIONS");
		}
		if(Object.keys(query).length === 3){
			if (!Object.keys(query).includes("TRANSFORMATIONS")) {
				throw new Error("TRANSFORMATION is missing");
			}
			const transformationKeys = Object.keys(query["TRANSFORMATIONS"]);
			if(transformationKeys.length > 2){
				throw Error("excess keys");
			}
			if(!transformationKeys.includes("GROUP") || !transformationKeys.includes("APPLY")){
				throw new Error("GROUP or APPLY is missing in TRANSFORMATIONS");
			}
			this.validateGroups(query["TRANSFORMATIONS"]["GROUP"]);
			this.validateApply(query["TRANSFORMATIONS"]["APPLY"]);
			this.validateColumnsIsASubsetOfApply(query);
		}
	}

	private validateColumnsIsASubsetOfApply(query: any){
		let columns = query["OPTIONS"]["COLUMNS"];
		for(const column of columns){
			if(!this.transformKeys.includes(column)){
				throw new Error("column is not present in transform");
			}
		}
	}

	private validateCOLUMNS(query: any) {
		let columns = query["OPTIONS"]["COLUMNS"];
		validateArray(columns, "COLUMNS value is missing");
		if (columns.length < 1) {
			throw new Error("COLUMNS is empty");
		}
		for (const column of columns) {
			if(query["TRANSFORMATIONS"]){
				if(column.includes("_")){
					this.validateColumn(column);
				}
			} else {
				if(column.includes("_")){
					this.validateColumn(column);
				} else {
					throw Error("invalid column");
				}
			}
		}
	}

	private validateGroups(groups: any) {
		validateArray(groups, "GROUP value is missing");
		if (groups.length < 1) {
			throw new Error("GROUP is empty");
		}
		for (const group of groups) {
			this.validateColumn(group);
			this.transformKeys.push(group);
		}
	}

	private validateColumn(column: any) {
		let datasetId = column.split("_")[0];
		if (!this._datasetId) {
			this._datasetId = datasetId;
		}
		let key = column.split("_");
		if (key[0] !== this._datasetId) {
			throw new Error("Cannot query more than one dataset");
		}
		if (this._dataset_kind &&
			!validateMFIELD(key[1], this._dataset_kind) && !validateSFIELD(key[1], this._dataset_kind)) {
			throw new Error(`Invalid key ${key[1]} in COLUMNS/GROUP`);
		}
	}

	private validateApply(apply: any){
		validateArray(apply, "APPLY is not an array");
		for(const applyRule of apply) {
			this.validateApplyRule(applyRule);
		}
		if((new Set(this.transformKeys)).size !== this.transformKeys.length){
			throw new Error("duplicate keys");
		}
	}

	private validateApplyRule(applyRule: any){
		if (Object.keys(applyRule).length !== 1) {
			throw new Error("apply has more than one key");
		}
		let applyKeyName = Object.keys(applyRule)[0];
		if(applyKeyName.includes("_")){
			throw new Error("apply key has underscore");
		}
		if (Object.keys(applyRule[applyKeyName]).length !== 1) {
			throw new Error("apply body has more than one key");
		}
		let applyToken = Object.keys(applyRule[applyKeyName])[0];
		if(!Object.values(APPLYTOKEN).includes(applyToken as APPLYTOKEN)){
			throw new Error("invalid apply token token");
		}
		let key = applyRule[applyKeyName][applyToken];
		let datasetId = key.split("_")[0];
		if (datasetId !== this.datasetId) {
			throw new Error("Cannot query more than one dataset");
		}
		let keyField = key.split("_")[1];
		if (!this._dataset_kind) {
			throw new Error("Dataset kind could not be found");
		}
		if (!validateMFIELD(keyField, this._dataset_kind) && !validateSFIELD(keyField, this._dataset_kind)) {
			throw new Error(`Invalid key ${key[1]} in APPLY`);
		}
		if(applyToken !== APPLYTOKEN.COUNT && !validateMFIELD(keyField, this._dataset_kind)){
			throw new Error("key for APPLYTOKEN must be a number");
		}
		this.transformKeys.push(applyKeyName);
	}

	public get datasetId() {
		if (this._datasetId == null) {
			throw Error("datasetId has not been set");
		}
		return this._datasetId;
	}

	private validateORDER(COLUMNS: any, ORDER: any) {
		const orderKeys = typeof ORDER === "object" ? Object.keys(ORDER) : [];
		if (orderKeys.length === 2) {
			if (!orderKeys.includes("dir")) {
				throw new Error("ORDER missing 'dir' key");
			}
			if (!orderKeys.includes("keys")) {
				throw new Error("ORDER missing 'keys' key");
			}
			if (!DIRECTION.includes(ORDER["dir"] as Direction)) {
				throw new Error("Invalid ORDER direction");
			}
			validateArray(ORDER["keys"], "ORDER keys must be an array");
			if (ORDER["keys"].length === 0) {
				throw new Error("ORDER keys must be a non-empty array");
			}
			let keys: string[] = ORDER["keys"];
			keys.forEach((key) => {
				if (!COLUMNS.includes(key)) {
					throw new Error("All ORDER keys must be in COLUMNS");
				}
			});
		} else if (orderKeys.length === 0) {
			if (!COLUMNS.includes(ORDER)) {
				throw new Error("ORDER key must be in COLUMNS");
			}
		} else {
			throw new Error("");
		}
	}
}
