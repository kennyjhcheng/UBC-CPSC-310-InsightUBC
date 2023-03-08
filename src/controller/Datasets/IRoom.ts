// FROM: https://sites.google.com/view/ubc-cpsc310-22w2/project/checkpoint-2?authuser=0#h.czbjzdxctpoz
export interface IRoom {
	/** Full building name **/
	fullname: string;
	/** Short building name **/
	shortname: string;
	/** The room number. Not always number, represented as string**/
	number: string;
	/** room id. Should be rooms_shortname+"_"+rooms_number**/
	name: string;
	/** building address**/
	address: string;
	/** latitude of building**/
	lat: number;
	/** longitude of building**/
	lon: number;
	/** number of seats in room**/
	seats: number;
	/** room type**/
	type: string;
	/** room furniture**/
	furniture: string;
	/** link to full details online**/
	href: string;
}
