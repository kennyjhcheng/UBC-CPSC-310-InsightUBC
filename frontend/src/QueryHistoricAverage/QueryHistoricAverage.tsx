import React, { useState } from "react";
import {
	Button,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField
} from "@mui/material";
import {fetchInsight} from "../requests/fetchInsight";

interface CourseHistoricAverageData {
	"sections_dept": string;
	"sections_id": string;
	"sections_instructor": string;
	"historicAvg": number;
}

const initialData: CourseHistoricAverageData[] = [
];

function QueryHistoricAverage() {
	const [department, setDepartment] = useState<string>("");
	const [courseCode, setCourseCode] = useState<string>("");
	const [data, setData] = useState<CourseHistoricAverageData[]>(initialData);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// const newData = { department, courseCode };

		const newData = await fetchInsight("POST", "query", JSON.stringify(
			{
				"WHERE": {
					"AND": [
						{
							"IS": {
								"sections_dept": department
							}
						},
						{
							"IS": {
								"sections_id": courseCode
							}
						}
					]
				},
				"OPTIONS": {
					"COLUMNS": [
						"sections_dept",
						"sections_id",
						"sections_instructor",
						"historicAvg"
					],
					"ORDER": {
						"dir": "UP",
						"keys": [
							"historicAvg"
						]
					}
				},
				"TRANSFORMATIONS": {
					"GROUP": [
						"sections_dept",
						"sections_id",
						"sections_instructor"
					],
					"APPLY": [
						{
							"historicAvg": {
								"AVG": "sections_avg"
							}
						}
					]
				}
			}
		));
		setData(newData.result);
	};

	return (
		<>
			<form onSubmit={handleSubmit}>
				<TextField
					id="department"
					label="Department"
					value={department}
					onChange={(e) => setDepartment(e.target.value)}
				/>
				<TextField
					id="course-code"
					label="Course Code"
					value={courseCode}
					onChange={(e) => setCourseCode(e.target.value)}
				/>
				<Button type="submit" variant="contained" color="primary">
					Submit
				</Button>
			</form>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Course</TableCell>
							<TableCell>Instructor</TableCell>
							<TableCell>Historic Average</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data.map((item, index) => (
							<TableRow key={index}>
								<TableCell>{`${item.sections_dept}${item.sections_id}`}</TableCell>
								<TableCell>{item.sections_instructor}</TableCell>
								<TableCell>{item.historicAvg}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
}

export default QueryHistoricAverage;
