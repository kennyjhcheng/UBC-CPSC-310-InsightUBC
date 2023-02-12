import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError, ResultTooLargeError,
} from "./IInsightFacade";
import JSZip from "jszip";
import {ISection} from "./ISection";
import {objectToSection, validateSectionJson} from "./Section";
import * as fs from "fs-extra";
import path from "path";
import {QueryValidator} from "./QueryValidator";
import {QueryExecutor} from "./QueryExecutor";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string, ISection[]>;

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = new Map<string, ISection[]>();
		// this.initializeDatasets();
	}

	private initializeDatasets() {
		let numDatasets: number = 0;
		fs.ensureDir(path.join(__dirname, "../../data/"))
			.then(() => {
				return fs.readdir(path.join(__dirname, "../../data/"));
			})
			.then((files) => {
				numDatasets = files.length;
				let promises: Array<Promise<string[]>> = [];
				for (const file of files) {
					promises.push(
						this.addDataset(file.split(".")[0], this.getContentFromData(file), InsightDatasetKind.Sections)
					);
				}
				return Promise.all(promises);
			})
			.then((listOfListOfIds) => {
				if (listOfListOfIds.length !== numDatasets) {
					return new InsightError(
						"Added incorrect number of datasets from persistent directory at initialization"
					);
				}
			})
			.catch((err) => {
				console.log(err);
				return new InsightError(
					`Failed to initialize datasets from persistent disk directory with error: ${err}`
				);
			});
	}

	private getContentFromData(name: string): string {
		return fs.readFileSync("data/" + name).toString("base64");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const zipObject = new JSZip();
		const error: string = this.validateId(id);
		if (error) {
			return Promise.reject(new InsightError(error));
		}
		if (kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("instance of room"));
		}

		if (!content) {
			return Promise.reject(new InsightError("dataset content is invalid"));
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
		if (!id) {
			return "null was passed";
		}
		if (!this.testIdRegex(id)) {
			return "id does not match regex";
		}

		if (this.datasets.has(id)) {
			return "duplicate id";
		}
		return "";
	}

	/**
	 * Checks that id is NOT
	 * -> an empty string,
	 * -> only has whitespace
	 * -> has underscores
	 * @param id
	 * @returns boolean whether id matches regex
	 */
	private testIdRegex(id: string): boolean {
		return /^[^_]+$/.test(id) && /^(?!\s*$).+/.test(id);
	}

	private parseFile(zipObject: JSZip, content: string, id: string) {
		return zipObject
			.loadAsync(content, {base64: true})
			.then((data) => {
				let files = data.filter((relativePath: string, file: JSZip.JSZipObject) => {
					return file.name.startsWith("courses/") && !file.name.includes(".DS_Store") && !file.dir;
				});
				if (files.length === 0) {
					return Promise.reject(new InsightError("empty course folder"));
				}
				let promises: Array<Promise<string>> = [];
				for (const file of files) {
					promises.push(file.async("string"));
				}
				return Promise.all(promises);
			})
			.then((values) => {
				let data: ISection[] = [];
				let emptyFiles = 0;
				for (const course of values) {
					const parsedCourse = JSON.parse(course);
					if (parsedCourse.result === undefined || parsedCourse.rank === undefined) {
						return Promise.reject(new InsightError("invalid json file"));
					}
					if (parsedCourse.result.length === 0) {
						emptyFiles++;
					}
					for (const section of parsedCourse.result) {
						if (validateSectionJson(section)) {
							data.push(objectToSection(section));
						}
					}
				}
				if (emptyFiles === values.length) {
					return Promise.reject(new InsightError("empty data"));
				}
				if (data.length === 0) {
					return Promise.reject(new InsightError("Dataset contains invalid section"));
				}
				return Promise.resolve(this.persistToDisk(id, data, content));
			})
			.catch((err) => {
				return Promise.reject(new InsightError(err.message));
			});
	}

	private async persistToDisk(id: string, dataset: ISection[], b64Content: string): Promise<string[]> {
		this.datasets.set(id, dataset);
		try {
			await fs.ensureDir(path.join(__dirname, "../../data/"));
			await fs.writeFile(path.join(__dirname, `../../data/${id}.zip`), b64Content, "base64");
		} catch (e) {
			console.log(e);
			return Promise.reject(new InsightError("couldn't write dataset"));
		}
		return Promise.resolve(Array.from(this.datasets.keys()));
	}

	public removeDataset(id: string): Promise<string> {
		if (!this.testIdRegex(id)) {
			return Promise.reject(new InsightError("Improper id format, has underscore, only whitespace, or is empty"));
		}
		// returns false if dataset doesn't exist
		if (!this.datasets.delete(id)) {
			return Promise.reject(new NotFoundError(`Dataset with id ${id} not found`));
		}

		return fs
			.ensureDir(path.join(__dirname, "../../data/"))
			.then(() => {
				return fs.remove(path.join(__dirname, `../../data/${id}.zip`));
			})
			.then(() => {
				return Promise.resolve(id);
			})
			.catch((err) => {
				console.log(err);
				return Promise.reject(new InsightError("Error removing dataset from disk"));
			});
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const queryValidator: QueryValidator = new QueryValidator();
		let result: InsightResult[];
		try {
			queryValidator.setDatasetId(query);
			queryValidator.validateQuery(query);
			if (!this.datasets.has(queryValidator.datasetId)) {
				return Promise.reject(new InsightError("Queried dataset does not exist"));
			}
			let id: string = queryValidator.datasetId;
			const queryExecutor: QueryExecutor = new QueryExecutor(this.datasets.get(id) as ISection[]);
			result = queryExecutor.executeQuery(query);
			if(result?.length > 5000){
				return Promise.reject(new ResultTooLargeError());
			}

		} catch (e) {
			return Promise.reject(new InsightError(`Invalid Query: ${e}`));
		}
		return Promise.resolve(result); // stub
	}

	public listDatasets(): Promise<InsightDataset[]> {
		const results = [] as InsightDataset[];
		for (const [key, value] of this.datasets) {
			const result = {} as InsightDataset;
			result.id = key;
			// I think we need to store the "data kind" in our map and refactor next line for next checkpoints
			// But we can get away with it in this phase
			result.kind = InsightDatasetKind.Sections;
			result.numRows = value.length;
			results.push(result);
		}
		return Promise.resolve(results);
	}
}
