export const queryPassORDERDOWNSINGLEKEY = {
	WHERE: {
		AND: [
			{
				IS: {
					rooms_fullname: "School of Population and Public Health"
				}
			}
		]
	},
	OPTIONS: {
		COLUMNS: [
			"rooms_shortname",
			"rooms_fullname",
			"rooms_number",
			"rooms_name",
			"rooms_address",
			"rooms_lat",
			"rooms_lon",
			"rooms_seats",
			"rooms_type",
			"rooms_furniture",
			"rooms_href"
		],
		ORDER: {
			dir: "DOWN",
			keys: [
				"rooms_shortname"
			]
		}
	}
};
export const expectedPassORDERDOWNSINGLEKEY = [
	{
		rooms_shortname: "SPPH",
		rooms_fullname: "School of Population and Public Health",
		rooms_number: "143",
		rooms_name: "SPPH_143",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 28,
		rooms_type: "Small Group",
		rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-143"
	},
	{
		rooms_shortname: "SPPH",
		rooms_fullname: "School of Population and Public Health",
		rooms_number: "B108",
		rooms_name: "SPPH_B108",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 30,
		rooms_type: "Small Group",
		rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B108"
	},
	{
		rooms_shortname: "SPPH",
		rooms_fullname: "School of Population and Public Health",
		rooms_number: "B112",
		rooms_name: "SPPH_B112",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 16,
		rooms_type: "Small Group",
		rooms_furniture: "Classroom-Movable Tables & Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B112"
	},
	{
		rooms_shortname: "SPPH",
		rooms_fullname: "School of Population and Public Health",
		rooms_number: "B136",
		rooms_name: "SPPH_B136",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 12,
		rooms_type: "Small Group",
		rooms_furniture: "Classroom-Movable Tables & Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B136"
	},
	{
		rooms_shortname: "SPPH",
		rooms_fullname: "School of Population and Public Health",
		rooms_number: "B138",
		rooms_name: "SPPH_B138",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 14,
		rooms_type: "Small Group",
		rooms_furniture: "Classroom-Movable Tables & Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B138"
	},
	{
		rooms_shortname: "SPPH",
		rooms_fullname: "School of Population and Public Health",
		rooms_number: "B151",
		rooms_name: "SPPH_B151",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 66,
		rooms_type: "Open Design General Purpose",
		rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B151"
	}
];
