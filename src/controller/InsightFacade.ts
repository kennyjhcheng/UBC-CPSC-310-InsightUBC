import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import * as fs from "fs-extra";
import path from "path";
import {QueryValidator} from "./QueryValidator";
import {QueryExecutor} from "./QueryExecutor";
import {arraysEqual} from "./utils";
import Section from "./Datasets/Section";
import Room from "./Datasets/Room";
import {IDataset} from "./Datasets/IDataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly SECTION_KIND_STRING = "Sections";
	private readonly ROOMS_KIND_STRING = "Rooms";
	private datasets: Map<string, IDataset>;
	private dataLoaded: boolean;

	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.datasets = new Map<string, IDataset>();
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
			await fs.ensureDir(path.join(__dirname, "../../data/Sections/"));
			await fs.ensureDir(path.join(__dirname, "../../data/Rooms/"));
			let sectionFiles: string[] = await fs.readdir(
				path.join(__dirname, `../../data/${this.SECTION_KIND_STRING}/`));
			let roomFiles: string[] = await fs.readdir(path.join(__dirname, `../../data/${this.ROOMS_KIND_STRING}/`));
			numDatasets = sectionFiles.length + roomFiles.length;
			let promises: Array<Promise<string[]>> = [];
			this.getFilesPromises(sectionFiles, promises, InsightDatasetKind.Sections);
			this.getFilesPromises(roomFiles, promises, InsightDatasetKind.Rooms);
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

	private getFilesPromises(sectionFiles: string[], promises: Array<Promise<string[]>>, kind: InsightDatasetKind) {
		for (const file of sectionFiles) {
			promises.push(
				this.addDatasetFromPersistDisk(
					file.split(".")[0],
					this.getContentFromData(file, kind),
					kind)
			);
		}
	}

	private getContentFromData(name: string, kind: InsightDatasetKind): string {
		return fs.readFileSync(`data/${this.getKindString(kind)}/` + name).toString("base64");
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
				return this.persistToDisk(id, content, kind);
			}).catch((e) => {
				return Promise.reject(new InsightError(e.message));
			});
	}

	private addDatasetFromPersistDisk(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		const error: string = this.validateId(id);
		if (error) {
			return Promise.reject(new InsightError(error));
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


	private async persistToDisk(id: string, b64Content: string, kind: InsightDatasetKind): Promise<string[]> {
		let kindString: string = this.getKindString(kind);
		try {
			await fs.ensureDir(path.join(__dirname, `../../data/${kindString}`));
			await fs.writeFile(path.join(__dirname, `../../data/${kindString}/${id}.zip`), b64Content, "base64");
		} catch (e) {
			console.log(e);
			return Promise.reject(new InsightError("couldn't write dataset"));
		}
		return Promise.resolve(Array.from(this.datasets.keys()));
	}

	private getKindString(kind: InsightDatasetKind): string {
		return kind === InsightDatasetKind.Sections ?
			this.SECTION_KIND_STRING : this.ROOMS_KIND_STRING;
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
				const queryExecutor: QueryExecutor = new QueryExecutor(this.datasets.get(id) as IDataset);
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

	public listDatasets(): Promise<InsightDataset[]> {
		return this.checkDataLoaded()
			.then(() => {
				const results = [] as InsightDataset[];
				for (const [key, value] of this.datasets) {
					const result = {} as InsightDataset;
					result.id = key;
					result.kind = value.kind ;
					result.numRows = value.data.length;
					results.push(result);
				}
				return Promise.resolve(results);
			});
	}
}
