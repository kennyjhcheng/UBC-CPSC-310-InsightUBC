import {ISection} from "./ISection";
import Dataset from "./Dataset";
import JSZip from "jszip";
import {InsightDatasetKind, InsightError} from "../IInsightFacade";

export function objectToSection(sectionObject: any): ISection {
	const section = {} as ISection;
	section["audit"] = Number(sectionObject["Audit"]);
	section["avg"] = Number(sectionObject["Avg"]);
	section["dept"] = String(sectionObject["Subject"]);
	section["fail"] = Number(sectionObject["Fail"]);
	section["id"] = String(sectionObject["Course"]);
	section["instructor"] = String(sectionObject["Professor"]);
	section["pass"] = Number(sectionObject["Pass"]);
	section["title"] = String(sectionObject["Title"]);
	section["uuid"] = String(sectionObject["id"]);
	section["year"] = sectionObject["Section"] === "overall" ? 1900 : Number(sectionObject["Year"]);
	return section;
}

export function validateSectionJson(sectionJson: any): boolean {
	if (
		!("id" in sectionJson) ||
		!("Course" in sectionJson) ||
		!("Title" in sectionJson) ||
		!("Professor" in sectionJson) ||
		!("Subject" in sectionJson) ||
		!("Year" in sectionJson) ||
		!("Avg" in sectionJson) ||
		!("Pass" in sectionJson) ||
		!("Fail" in sectionJson) ||
		!("Audit" in sectionJson) ||
		!("Section" in sectionJson)
	) {
		return false;
	}
	return true;
}

export default class Section extends Dataset {
	protected parseDataset(data: JSZip, id: string): Promise<string[]> {
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
		return Promise.all(promises).then((values) => {
			let sectionData: ISection[] = [];
			let emptyFiles = 0;
			for (const course of values) {
				const parsedCourse = JSON.parse(course);
				if (parsedCourse.result === undefined) {
					return Promise.reject(new InsightError("invalid json file"));
				}
				if (parsedCourse.result.length === 0) {
					emptyFiles++;
				}
				for (const section of parsedCourse.result) {
					if (validateSectionJson(section)) {
						sectionData.push(objectToSection(section));
					}
				}
			}
			if (emptyFiles === values.length) {
				return Promise.reject(new InsightError("empty data"));
			}
			if (sectionData.length === 0) {
				return Promise.reject(new InsightError("Dataset.ts contains invalid section"));
			}
			this.datasets.set(id, {data: sectionData, kind: InsightDatasetKind.Sections});
			return Promise.resolve(Array.from(this.datasets.keys()));
		});
	}
}
