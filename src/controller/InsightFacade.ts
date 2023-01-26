import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult,} from "./IInsightFacade";
import jszip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string,string[]>;
	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = new Map<string, string[]>();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(!id){
			return Promise.reject(new InsightError("null was passed"));
		}
		if(id === ""){
			return Promise.reject(new InsightError("id is empty string"));
		}
		if(id.includes("_")){
			return Promise.reject(new InsightError("id has underscore"));
		}
		if(!id.replace(/\s/g, "").length){
			return Promise.reject(new InsightError("id only has whitespace"));
		}
		if(this.datasets.has(id)){
			return Promise.reject(new InsightError("duplicate id"));
		}
		if(kind === InsightDatasetKind.Rooms){
			return Promise.reject(new InsightError("instance of room"));
		}
		return jszip.loadAsync(content,{base64 : true})
			.then((data) => {
				console.log(data);
				return Promise.resolve(["data"]);
			})
			.catch((err) => {
				return Promise.reject(err);
			});
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
