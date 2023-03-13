import {ISection} from "./ISection";
import {IRoom} from "./IRoom";
import {InsightDatasetKind} from "../IInsightFacade";

export interface IDataset {
	data: ISection[] | IRoom[];
	kind: InsightDatasetKind;
};
