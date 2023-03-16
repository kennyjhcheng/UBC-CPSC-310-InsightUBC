export const expectedPassApplyOrderUP = [
	{
		rooms_fullname: "Auditorium Annex",
		maxSeats: 21
	},
	{
		rooms_fullname: "Ponderosa Commons: Oak House",
		maxSeats: 40
	},
	{
		rooms_fullname: "War Memorial Gymnasium",
		maxSeats: 40
	},
	{
		rooms_fullname: "Earth and Ocean Sciences - Main",
		maxSeats: 50
	},
	{
		rooms_fullname: "The Leon and Thea Koerner University Centre",
		maxSeats: 55
	},
	{
		rooms_fullname: "Mathematics",
		maxSeats: 60
	},
	{
		rooms_fullname: "Neville Scarfe",
		maxSeats: 60
	},
	{
		rooms_fullname: "Frank Forward",
		maxSeats: 63
	},
	{
		rooms_fullname: "School of Population and Public Health",
		maxSeats: 66
	},
	{
		rooms_fullname: "Jack Bell Building for the School of Social Work",
		maxSeats: 68
	},
	{
		rooms_fullname: "Brock Hall Annex",
		maxSeats: 70
	},
	{
		rooms_fullname: "Orchard Commons",
		maxSeats: 72
	},
	{
		rooms_fullname: "MacMillan",
		maxSeats: 74
	},
	{
		rooms_fullname: "Biological Sciences",
		maxSeats: 76
	},
	{
		rooms_fullname: "Anthropology and Sociology",
		maxSeats: 90
	},
	{
		rooms_fullname: "Allard Hall (LAW)",
		maxSeats: 94
	},
	{
		rooms_fullname: "Frederic Lasserre",
		maxSeats: 94
	},
	{
		rooms_fullname: "Food, Nutrition and Health",
		maxSeats: 99
	},
	{
		rooms_fullname: "Forest Sciences Centre",
		maxSeats: 99
	},
	{
		rooms_fullname: "Civil and Mechanical Engineering",
		maxSeats: 100
	},
	{
		rooms_fullname: "Geography",
		maxSeats: 100
	},
	{
		rooms_fullname: "Iona Building",
		maxSeats: 100
	},
	{
		rooms_fullname: "Wesbrook",
		maxSeats: 102
	},
	{
		rooms_fullname: "Mathematics Annex",
		maxSeats: 106
	},
	{
		rooms_fullname: "Chemistry",
		maxSeats: 114
	},
	{
		rooms_fullname: "MacLeod",
		maxSeats: 136
	},
	{
		rooms_fullname: "Aquatic Ecosystems Research Laboratory",
		maxSeats: 144
	},
	{
		rooms_fullname: "Earth Sciences Building",
		maxSeats: 150
	},
	{
		rooms_fullname: "Irving K Barber Learning Centre",
		maxSeats: 154
	},
	{
		rooms_fullname: "Hennings",
		maxSeats: 155
	},
	{
		rooms_fullname: "Friedman Building",
		maxSeats: 160
	},
	{
		rooms_fullname: "Hugh Dempster Pavilion",
		maxSeats: 160
	},
	{
		rooms_fullname: "Buchanan",
		maxSeats: 181
	},
	{
		rooms_fullname: "Woodward (Instructional Resources Centre-IRC)",
		maxSeats: 181
	},
	{
		rooms_fullname: "West Mall Swing Space",
		maxSeats: 190
	},
	{
		rooms_fullname: "Chemical and Biological Engineering Building",
		maxSeats: 200
	},
	{
		rooms_fullname: "Leonard S. Klinck (also known as CSCI)",
		maxSeats: 205
	},
	{
		rooms_fullname: "Pharmaceutical Sciences Building",
		maxSeats: 236
	},
	{
		rooms_fullname: "Henry Angus",
		maxSeats: 260
	},
	{
		rooms_fullname: "Student Recreation Centre",
		maxSeats: 299
	},
	{
		rooms_fullname: "Life Sciences Centre",
		maxSeats: 350
	},
	{
		rooms_fullname: "Hebb",
		maxSeats: 375
	},
	{
		rooms_fullname: "Robert F. Osborne Centre",
		maxSeats: 442
	}
];
export const queryPassORDERDOWNMULTIKEY = {
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
				"rooms_shortname",
				"rooms_number",
				"rooms_name"
			]
		}
	}
};
export const expectedPassORDERDOWNMULTIKEY = [
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
		rooms_number: "143",
		rooms_name: "SPPH_143",
		rooms_address: "2206 East Mall",
		rooms_lat: 49.2642,
		rooms_lon: -123.24842,
		rooms_seats: 28,
		rooms_type: "Small Group",
		rooms_furniture: "Classroom-Fixed Tables/Movable Chairs",
		rooms_href: "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-143"
	}
];
