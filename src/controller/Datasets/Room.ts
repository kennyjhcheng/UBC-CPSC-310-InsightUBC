import Dataset from "./Dataset";
import JSZip, {JSZipObject} from "jszip";
import {InsightDatasetKind, InsightError} from "../IInsightFacade";
import {parse} from "parse5";
import {Document} from "parse5/dist/tree-adapters/default";
import {IRoom} from "./IRoom";
import {IDataset} from "./IDataset";
import {IGeoResponse} from "./IGeolocation";
import Geolocation from "./Geolocation";


export default class Room extends Dataset {
	private readonly ROOM_INDEX_FILE_PATH = "index.htm";
	private readonly BUILDING_ROOM_FOLDER_PATH = "campus/discover/buildings-and-classrooms";
	private readonly SHORTNAME_ATTRIBUTE = "views-field views-field-field-building-code";
	private readonly ADDRESS_ATTRIBUTE = "views-field views-field-field-building-address";
	private readonly BULIDING_FULLNAME_ATTRIBUTE = "views-field views-field-title";
	private readonly FURNITURE_ATTRIBUTE = "views-field views-field-field-room-furniture";
	private readonly TYPE_ATTRIBUTE = "views-field views-field-field-room-type";
	private readonly SEATS_ATTRIBUTE = "views-field views-field-field-room-capacity";
	private readonly NUMBER_HREF_ATTRIBUTE = "views-field views-field-field-room-number";
	private buildings: Map<string, IRoom>;


	constructor(datasets: Map<string, IDataset>) {
		super(datasets);
		this.buildings = new Map();
	}

	protected parseDataset(data: JSZip, id: string): Promise<string[]> {
		let indexFile: JSZipObject | null = data.file(this.ROOM_INDEX_FILE_PATH);
		let roomsFolder: JSZip | null = data.folder(this.BUILDING_ROOM_FOLDER_PATH) ;
		if (indexFile === null) {
			return Promise.reject(new InsightError("null index htm file"));
		}

		return indexFile.async("string")
			.then((htmString: string) => {
				const htmDoc: Document = parse(htmString);
				for (let node of htmDoc.childNodes) {
					if (node.nodeName === "html") {
						return this.addBuildings(node);
					}
				}
			}).then(() => {
				let requests: Array<Promise<boolean>> = this.setBuildingLonLat();
				return Promise.allSettled(requests);
			}).then(() => {
				if (!roomsFolder) {
					return Promise.reject(new InsightError("null room folders"));
				}
				return Promise.all(this.extractRooms(roomsFolder));
			}).then((roomLists) => {
				let rooms: IRoom[] = [];
				for (let roomList of roomLists) {
					for (let room of roomList) {
						rooms.push(room);
					}
				}
				if(rooms.length === 0){
					return Promise.reject(new InsightError("no valid rooms found"));
				}
				this.datasets.set(id, {data: rooms, kind: InsightDatasetKind.Rooms});
				return Promise.resolve(Array.from(this.datasets.keys()));
			}).catch((e) => {
				return Promise.reject(new InsightError("Error converting index file to string: " + e));
			});
	}

	private extractRooms(roomsFolder: JSZip): Array<Promise<IRoom[]>> {
		let roomListsPromises: Array<Promise<IRoom[]>> = [];
		roomsFolder.forEach((relativePath: string, file: JSZipObject) => {
			roomListsPromises.push(file.async("string")
				.then((htmString: string) => {
					const htmDoc: Document = parse(htmString);
					const building = this.buildings.get(relativePath.split(".")[0]);
					for (let node of htmDoc.childNodes) {
						if (node.nodeName === "html") {
							let rooms: IRoom[] = this.addRooms(node, building);
							return Promise.resolve(rooms);
						}
					}
					return Promise.reject(new InsightError("could not locate html element"));
				}).catch((e) => {
					return Promise.reject(new InsightError("could not read rooms: " + e));
				}));
		});
		return roomListsPromises;
	}

	private setBuildingLonLat(): Array<Promise<boolean>> {
		let requests: Array<Promise<boolean>> = [];
		this.buildings.forEach((value, key) => {
			const req: Promise<boolean> = new Promise((resolve, reject) => {
				Geolocation.getLonLat(value.address)
					.then((geo: IGeoResponse) => {
						if (!geo.lat || !geo.lon) {
							return reject(geo.error);
						}
						value.lat = geo.lat;
						value.lon = geo.lon;
						resolve(true);
					}).catch((e) => {
						reject(e);
					});
			});
			requests.push(req);
		});

		return requests;
	}

	private addRooms(currNode: any, building: any): IRoom[] {
		const rooms: IRoom[] = [];
		for (let node of currNode.childNodes) {
			let currNodeName = node.nodeName;
			if (currNodeName === "body"
				|| currNodeName === "table"
				|| currNodeName === "section"
				|| currNodeName === "div") {
				this.addRooms(node, building).forEach((room: IRoom) => {
					rooms.push((room));
				});
			}
			if (currNodeName === "tbody") {
				for (let tableNode of node.childNodes) {
					if (tableNode.nodeName === "tr") {
						let room: IRoom = this.getRoom(tableNode, building);
						if (this.validateRoom(room)) {
							rooms.push(room);
						}
					}
				}
			}
		}
		return rooms;
	}

	private validateRoom(room: IRoom) {
		if (
			!("fullname" in room) ||
			!("shortname" in room) ||
			!("number" in room) ||
			!("name" in room) ||
			!("address" in room) ||
			!("lat" in room) ||
			!("lon" in room) ||
			!("seats" in room) ||
			!("type" in room) ||
			!("furniture" in room) ||
			!("href" in room)
		) {
			return false;
		}
		return true;
	}

	private getRoom(node: any, building: IRoom): IRoom {
		let room: IRoom = {...building};
		for (let child of node.childNodes) {
			if (child.nodeName === "td") {
				this.setRoomCellData(child, room);
			}
		}
		return room;
	}

	private addBuildings(currNode: any) {
		for (let node of currNode.childNodes) {
			let currNodeName = node.nodeName;
			if (currNodeName === "body"
				|| currNodeName === "table"
				|| currNodeName === "section"
				|| currNodeName === "div") {
				this.addBuildings(node);
			}
			if (currNodeName === "tbody") {
				for (let tableNode of node.childNodes) {
					if (tableNode.nodeName === "tr") {
						this.extractBuilding(tableNode);
					}
				}
			}
		}
	}

	private extractBuilding(tableRowNode: any) {
		let building: IRoom = {} as IRoom;
		for (let node of tableRowNode.childNodes) {
			if (node.nodeName === "td") {
				this.setRoomCellData(node, building);
			}
			if (building.shortname) {
				this.buildings.set(building.shortname, building);
			}
		}
	}

	private setRoomCellData(node: any, room: IRoom) {

		switch (node.attrs[0]["value"]) {
			case this.BULIDING_FULLNAME_ATTRIBUTE:
				room.fullname = this.extractBuildingFullName(node);
				break;
			case this.SHORTNAME_ATTRIBUTE:
				room.shortname = this.extractTableCellText(node);
				break;
			case this.ADDRESS_ATTRIBUTE:
				room.address = this.extractTableCellText(node);
				break;
			case this.NUMBER_HREF_ATTRIBUTE:
				room.href = this.extractHref(node);
				room.number = this.extractRoomNumber(node);
				room.name = room.shortname + "_" + room.number;
				break;
			case this.SEATS_ATTRIBUTE:
				room.seats = Number(this.extractTableCellText(node));
				break;
			case this.TYPE_ATTRIBUTE:
				room.type = this.extractTableCellText(node);
				break;
			case this.FURNITURE_ATTRIBUTE:
				room.furniture = this.extractTableCellText(node);
				break;
		}
	}

	private extractHref(node: any): string {
		let anchor = this.getAnchorNode(node);
		return anchor.attrs[0].value;
	}

	private extractRoomNumber(node: any): string {
		let anchor = this.getAnchorNode(node);
		return this.extractTableCellText(anchor);
	}

	private extractBuildingFullName(node: any): string {
		let anchor = this.getAnchorNode(node);
		let anchorTitle = "Building Details and Map";
		return anchor.attrs[1]["value"] === anchorTitle ?
			this.extractTableCellText(anchor) : "";
	}

	private getAnchorNode(node: any): any {
		for (let child of node.childNodes) {
			if (child.nodeName === "a") {
				return child;
			}
		}
		return null;
	}

	private extractTableCellText(node: any): string {
		for (let child of node.childNodes) {
			if (child.nodeName === "#text") {
				return this.extractText(child.value);
			}
		}
		return "";
	}

	private extractText(value: string) {
		return value.replace("\n", "").trim();
	}
}
