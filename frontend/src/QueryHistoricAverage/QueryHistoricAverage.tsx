import React, { useState } from "react";
import {
	Button, Dialog, DialogContent, DialogTitle, IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField, Typography
} from "@mui/material";
import {fetchInsight} from "../requests/fetchInsight";
import {Close} from "@mui/icons-material";

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
	const [open, setOpen] = useState<boolean>(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// const newData = { department, courseCode };

		const newData = await fetchInsight("POST", "query", JSON.stringify(
			{
				"WHERE": {
					"AND": [
						{
							"IS": {
								"sections_dept": department.trim().toLowerCase()
							}
						},
						{
							"IS": {
								"sections_id": courseCode.trim()
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
						"dir": "DOWN",
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
		if (newData.result.length === 0) setOpen(true);
	};

	const onClose = () =>
		setOpen(false);

	const handleReset = () => {
		setCourseCode("");
		setDepartment("");
		setData([]);
	}
	return (
		<>
			<Typography variant="h5" sx={{ my: 1 }}>
				Search Course
			</Typography>
			<form onSubmit={handleSubmit} onReset={handleReset}>
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
				<Button type="reset" variant="contained" color="primary">
					Reset
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
								<TableCell>{item.sections_instructor ? item.sections_instructor : "NOT FOUND"}</TableCell>
								<TableCell>{item.historicAvg}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Dialog open={open} onClose={onClose}>
				<DialogTitle style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
					<Typography variant="h6" style={{color: 'red'}} >Error</Typography>
					<IconButton onClick={onClose}>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography variant="body1">{"Course not found, please ensure Deparment and Course code are correct (e.g. cpsc 110)"}</Typography>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default QueryHistoricAverage;
