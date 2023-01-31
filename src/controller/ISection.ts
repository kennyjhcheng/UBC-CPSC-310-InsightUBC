// FROM: https://lh3.googleusercontent.com/csGcBNFxV8RfABG3XC4B55WlJ2N-zxL2J5EIm8g6-WyfoF4U2eC0bAM8cEUnsFPBdew_AYPb6MIXcntqd1ZKQ0rBN2-31sVm4f8TEodpkVzl_J84HKBNQrSpLPEGRKD8Tg=w1280
export interface ISection {
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
