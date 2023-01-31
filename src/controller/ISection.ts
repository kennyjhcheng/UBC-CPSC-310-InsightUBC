// FROM: shorturl.at/qxS37
export interface ISectionData {
	/** identifier for section **/
	uuid: string;
	/** course identifier **/
	id: string;
	/** name of course **/
	title: string;
	/** name of instructor who taught section **/
	instructor: string;
	/** department offering section **/
	dept: string;
	/** year in which section was run. Set to 1900 when section = "overall" **/
	year: number;
	/** average grade received by students in the section **/
	avg: number;
	/** # passing students in section **/
	pass: number;
	/** # failing students in section **/
	fail: number;
	/** # students who audited the section **/
	audit: number;
}
