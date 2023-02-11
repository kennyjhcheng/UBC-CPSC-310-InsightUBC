import {ISection} from "./ISection";

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
		!("Audit" in sectionJson) ||
		!("Avg" in sectionJson) ||
		!("Subject" in sectionJson) ||
		!("Fail" in sectionJson) ||
		!("Course" in sectionJson) ||
		!("Professor" in sectionJson) ||
		!("Pass" in sectionJson) ||
		!("Title" in sectionJson) ||
		!("id" in sectionJson) ||
		!("Section" in sectionJson)
	) {
		return false;
	}
	return true;
}
