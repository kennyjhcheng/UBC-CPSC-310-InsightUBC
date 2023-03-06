import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import {ISection} from "./Datasets/ISection";
import * as fs from "fs-extra";
import path from "path";
import {QueryValidator} from "./QueryValidator";
import {QueryExecutor} from "./QueryExecutor";
import {arraysEqual} from "./utils";
import Section from "./Datasets/Section";
import Room from "./Datasets/Room";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasets: Map<string, ISection[]>;
	private dataLoaded: boolean;

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = new Map<string, ISection[]>();
		this.dataLoaded = false;
	}

	private async checkDataLoaded() {
		if (this.dataLoaded) {
			return;
		}
		try {
			await this.initializeDatasets();
			this.dataLoaded = true;
		} catch (e) {
			console.log(e);
			return new InsightError(
				`Failed to initialize datasets from persistent disk directory with error: ${e}`
			);
		}
	}

	private async initializeDatasets() {
		let numDatasets: number = 0;
		try {
			await fs.ensureDir(path.join(__dirname, "../../data/"));
			let files: string[] = await fs.readdir(path.join(__dirname, "../../data/"));
			numDatasets = files.length;
			let promises: Array<Promise<string[]>> = [];
			for (const file of files) {
				promises.push(
					this.addDatasetFromPersistDisk(
						file.split(".")[0],
						this.getContentFromData(file), InsightDatasetKind.Sections)
				);
			}
			let listOfListOfIds: string[][] = await Promise.all(promises);
			if (listOfListOfIds.length !== numDatasets ||
				!arraysEqual(listOfListOfIds[listOfListOfIds.length - 1], Array.from(this.datasets.keys()))
			) {
				return new InsightError(
					"Added incorrect number of datasets from persistent directory at initialization"
				);
			}
		} catch (e) {
			console.log(e);
			return new InsightError(
				`Failed to initialize datasets from persistent disk directory with error: ${e}`
			);
		}
	}

	private getContentFromData(name: string): string {
		return fs.readFileSync("data/" + name).toString("base64");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return this.checkDataLoaded()
			.then(() => {
				const error: string = this.validateId(id);
				if (error) {
					return Promise.reject(new InsightError(error));
				}

				if (!content) {
					return Promise.reject(new InsightError("dataset content is invalid"));
				}

				if (kind === InsightDatasetKind.Sections) {
					const sectionHelper: Section = new Section(this.datasets);
					return sectionHelper.parseFile(content, id);
				}
				const roomsHelper: Room = new Room(this.datasets);
				return roomsHelper.parseFile(content, id);
			}).then(() => {
				return this.persistToDisk(id, content);
			}).catch((e) => {
				return Promise.reject(new InsightError(e.message));
			});
	}

	private addDatasetFromPersistDisk(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
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

		if (kind === InsightDatasetKind.Sections) {
			const sectionsHelper: Section = new Section(this.datasets);
			return sectionsHelper.parseFile(content, id).then((files) => {
				return Promise.resolve(files);
			}).catch((e) => {
				return Promise.reject(new InsightError(e.message));
			});
		}
		const roomHelper: Room = new Room(this.datasets);
		return roomHelper.parseFile(content, id).then((files) => {
			return Promise.resolve(files);
		}).catch((e) => {
			return Promise.reject(new InsightError(e.message));
		});
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

	private async persistToDisk(id: string, b64Content: string): Promise<string[]> {
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
		return this.checkDataLoaded()
			.then(() => {
				if (!this.testIdRegex(id)) {
					return Promise.reject(
						new InsightError("Improper id format, has underscore, only whitespace, or is empty")
					);
				}
				// returns false if dataset doesn't exist
				if (!this.datasets.delete(id)) {
					return Promise.reject(new NotFoundError(`Dataset with id ${id} not found`));
				}
				return fs.ensureDir(path.join(__dirname, "../../data/"));
			}).then(() => {
				return fs.remove(path.join(__dirname, `../../data/${id}.zip`));
			})
			.then(() => {
				return Promise.resolve(id);
			}).catch((e) => {
				if (e instanceof NotFoundError) {
					return Promise.reject(e);
				}
				return Promise.reject(new InsightError(e));
			});

	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return this.checkDataLoaded()
			.then(() => {
				const queryValidator: QueryValidator = new QueryValidator();
				let result: InsightResult[];

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

				return Promise.resolve(result);
			}).catch((e) => {
				if (e instanceof ResultTooLargeError) {
					return Promise.reject(e);
				}
				if (e instanceof NotFoundError) {
					return Promise.reject(e);
				}
				return Promise.reject(new InsightError(`Invalid Query: ${e}`));
			});
	}

	// TODO: I think we need to store the "data kind" in our map and refactor next line for next checkpoints
	public listDatasets(): Promise<InsightDataset[]> {
		return this.checkDataLoaded()
			.then(() => {
				const results = [] as InsightDataset[];
				for (const [key, value] of this.datasets) {
					const result = {} as InsightDataset;
					result.id = key;
					result.kind = InsightDatasetKind.Sections;
					result.numRows = value.length;
					results.push(result);
				}
				return Promise.resolve(results);
			});
	}
}
