import {IDataset} from "./IDataset";
import {InsightDatasetKind, InsightError} from "../IInsightFacade";
import JSZip from "jszip";

export default abstract class Dataset {
	protected datasets: Map<string, IDataset>;

	constructor(datasets: Map<string, IDataset>) {
		this.datasets = datasets;
	}

	public parseFile(content: string, id: string) {
		const zipObject = new JSZip();
		return zipObject
			.loadAsync(content, {base64: true})
			.then((data: JSZip) => {
				return this.parseDataset(data, id);
			}).catch((err) => {
				return Promise.reject(new InsightError(err.message));
			});
	}

	protected abstract parseDataset(data: JSZip, id: string): Promise<string[]>;

}
