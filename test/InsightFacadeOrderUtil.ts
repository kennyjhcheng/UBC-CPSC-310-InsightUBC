export const queryPassGroupAPPLYMAXSEATS = {
	WHERE: {
		AND: [
			{
				IS: {
					rooms_fullname: "*"
				}
			}
		]
	},
	OPTIONS: {
		COLUMNS: [
			"rooms_fullname",
			"maxSeats"
		],
		ORDER: {
			dir: "DOWN",
			keys: [
				"maxSeats"
			]
		}
	},
	TRANSFORMATIONS: {
		GROUP: [
			"rooms_fullname"
		],
		APPLY: [
			{
				maxSeats: {
					MAX: "rooms_seats"
				}
			}
		]
	}
};
export const expectedPassGroupAPPLYMAXSEATS = [
	{
		rooms_fullname: "Woodward (Instructional Resources Centre-IRC)",
		maxSeats: 503
	},
	{
		rooms_fullname: "Robert F. Osborne Centre",
		maxSeats: 442
	},
	{
		rooms_fullname: "Centre for Interactive  Research on Sustainability",
		maxSeats: 426
	},
	{
		rooms_fullname: "Hebb",
		maxSeats: 375
	},
	{
		rooms_fullname: "Earth Sciences Building",
		maxSeats: 350
	},
	{
		rooms_fullname: "Life Sciences Centre",
		maxSeats: 350
	},
	{
		rooms_fullname: "Wesbrook",
		maxSeats: 325
	},
	{
		rooms_fullname: "Student Recreation Centre",
		maxSeats: 299
	},
	{
		rooms_fullname: "Neville Scarfe",
		maxSeats: 280
	},
	{
		rooms_fullname: "Buchanan",
		maxSeats: 275
	},
	{
		rooms_fullname: "Chemistry",
		maxSeats: 265
	},
	{
		rooms_fullname: "Henry Angus",
		maxSeats: 260
	},
	{
		rooms_fullname: "Hennings",
		maxSeats: 257
	},
	{
		rooms_fullname: "Forest Sciences Centre",
		maxSeats: 250
	},
	{
		rooms_fullname: "Pharmaceutical Sciences Building",
		maxSeats: 236
	},
	{
		rooms_fullname: "Biological Sciences",
		maxSeats: 228
	},
	{
		rooms_fullname: "Geography",
		maxSeats: 225
	},
	{
		rooms_fullname: "Mathematics",
		maxSeats: 224
	},
	{
		rooms_fullname: "Leonard S. Klinck (also known as CSCI)",
		maxSeats: 205
	},
	{
		rooms_fullname: "Chemical and Biological Engineering Building",
		maxSeats: 200
	},
	{
		rooms_fullname: "MacMillan",
		maxSeats: 200
	},
	{
		rooms_fullname: "West Mall Swing Space",
		maxSeats: 190
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
		rooms_fullname: "Irving K Barber Learning Centre",
		maxSeats: 154
	},
	{
		rooms_fullname: "Aquatic Ecosystems Research Laboratory",
		maxSeats: 144
	},
	{
		rooms_fullname: "MacLeod",
		maxSeats: 136
	},
	{
		rooms_fullname: "Mathematics Annex",
		maxSeats: 106
	},
	{
		rooms_fullname: "Civil and Mechanical Engineering",
		maxSeats: 100
	},
	{
		rooms_fullname: "Iona Building",
		maxSeats: 100
	},
	{
		rooms_fullname: "Food, Nutrition and Health",
		maxSeats: 99
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
		rooms_fullname: "Anthropology and Sociology",
		maxSeats: 90
	},
	{
		rooms_fullname: "Orchard Commons",
		maxSeats: 72
	},
	{
		rooms_fullname: "Brock Hall Annex",
		maxSeats: 70
	},
	{
		rooms_fullname: "Jack Bell Building for the School of Social Work",
		maxSeats: 68
	},
	{
		rooms_fullname: "School of Population and Public Health",
		maxSeats: 66
	},
	{
		rooms_fullname: "Frank Forward",
		maxSeats: 63
	},
	{
		rooms_fullname: "The Leon and Thea Koerner University Centre",
		maxSeats: 55
	},
	{
		rooms_fullname: "Earth and Ocean Sciences - Main",
		maxSeats: 50
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
		rooms_fullname: "Auditorium Annex",
		maxSeats: 21
	}
];

export const queryPassApplyOrderString = {
	WHERE: {
		OR: [
			{
				IS: {
					rooms_furniture: "*Chairs*"
				}
			},
			{
				LT: {
					rooms_seats: 200
				}
			}
		]
	},
	OPTIONS: {
		COLUMNS: [
			"rooms_fullname",
			"maxSeats"
		],
		ORDER: "maxSeats"
	},
	TRANSFORMATIONS: {
		GROUP: [
			"rooms_fullname"
		],
		APPLY: [
			{
				maxSeats: {
					MAX: "rooms_seats"
				}
			}
		]
	}
};

