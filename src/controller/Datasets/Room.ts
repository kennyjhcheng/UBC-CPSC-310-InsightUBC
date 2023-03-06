import Dataset from "./Dataset";
import JSZip from "jszip";
import {InsightError} from "../IInsightFacade";

export default class Room extends Dataset {
	private readonly ROOM_INDEX_FILE_PATH = "index.htm";
	private readonly BUILDING_ROOM_FOLDER_PATH = "campus/discover/buildings-and-classrooms";
	protected parseDataset(data: JSZip, id: string): Promise<string[]> {
		let parsedZip: any;
		let indexFile = data.file(this.ROOM_INDEX_FILE_PATH);
		let buildingAndRoomsFolder = data.folder(this.BUILDING_ROOM_FOLDER_PATH);
		if (indexFile === null) {
			return Promise.reject(new InsightError("null index htm file"));
		}

		return Promise.resolve([]);
	}
}
