import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult,} from "./IInsightFacade";
import jszip, {JSZipObject} from "jszip";
import JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string,string[]>;
	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = new Map();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const zipObject = new JSZip();
		const error: string = this.validateId(id);
		if (error) {
			return Promise.reject(new InsightError(error));
		}
		if(kind === InsightDatasetKind.Rooms){
			return Promise.reject(new InsightError("instance of room"));
		}
		return this.parseFile(zipObject, content, id);
	}

	/**
	 * Checks whether an id is valid
	 * @param id
	 * @private
	 * @return empty string if valid, error message if invalid
	 */
	private validateId(id: string): string {
		if(!id){
			return "null was passed";
		}
		if(id === ""){
			return "id is empty string";
		}
		if(id.includes("_")){
			return "id has underscore";
		}
		if(!id.replace(/\s/g, "").length){
			return "id only has whitespace";
		}
		if(this.datasets.has(id)){
			return "duplicate id";
		}
		return "";
	}

	private parseFile(zipObject: JSZip, content: string, id: string) {
		return zipObject.loadAsync(content, {base64: true})
			.then((data) => {
				let files = data.filter((relativePath: string, file: JSZip.JSZipObject) => {
					return (file.name.startsWith("courses/") && !file.name.includes(".DS_Store")
						&& !file.dir);
				});
				if (files.length === 0) {
					return Promise.reject(new InsightError("empty course file"));
				}
				let promises: Array<Promise<string>> = [];
				for (const file of files) {
					promises.push(file.async("string"));
				}
				return Promise.all(promises);
			})
			.then((values) => {
				let data = [];
				let emptyFiles = 0;
				for (const course of values) {
					const parsedCourse = JSON.parse(course);
					if (parsedCourse.result === undefined || parsedCourse.rank === undefined) {
						return Promise.reject(new InsightError("invalid json file"));
					}
					if (parsedCourse.result.length === 0) {
						emptyFiles++;
					}
					for(const section of parsedCourse.result){
						data.push(section);
					}
				}
				if(emptyFiles === values.length){
					return Promise.reject(new InsightError("empty data"));
				}
				this.datasets.set(id,data);
				console.log(data);
				return Promise.resolve(Array.from(this.datasets.keys()));
			})
			.catch((err) => {
				console.log(err.message);
				return Promise.reject(new InsightError(err.message));
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
