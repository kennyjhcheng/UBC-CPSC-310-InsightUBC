import InsightFacade from "../../src/controller/InsightFacade";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {folderTest} from "@ubccpsc310/folder-test";
import {before} from "mocha";


chai.use(chaiAsPromised);
export default function sectionTests() {
	let sections: string;
	let smallSet: string;
	let smallSetNoRank: string;

	let facade: InsightFacade;

	before(function () {
		sections = getContentFromArchives("pair.zip");
		smallSet = getContentFromArchives("smalldataset.zip");
		smallSetNoRank = getContentFromArchives("smalldatanorank.zip");
	});

	// describe("addDataset", function () {
	// 	beforeEach(function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	// 	it("should reject with  an empty dataset id", function () {
	// 		const result = facade.addDataset("", smallSet, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("should reject with  an id with an underscore", function () {
	// 		const result = facade.addDataset("ubc_data", smallSet, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("should reject with  an id with just white spaces", function () {
	// 		const result = facade.addDataset("  ", smallSet, InsightDatasetKind.Sections);
	//
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("dataset failing because added twice", async function () {
	// 		try {
	// 			await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
	// 			await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			expect(err).be.instanceOf(InsightError);
	// 		}
	// 	});
	// 	it("adding a single dataset successfully", async function () {
	// 		const result: string[] = await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
	// 		expect(result).to.deep.equal(["data"]);
	// 	});
	// 	it("adding a single dataset without rank successfully", async function () {
	// 		const result: string[] = await facade.addDataset("data", smallSetNoRank, InsightDatasetKind.Sections);
	// 		expect(result).to.deep.equal(["data"]);
	// 	});
	// 	it("adding a two datasets with different ids successfully", async function () {
	// 		await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
	// 		const result2 = await facade.addDataset("data2", smallSet, InsightDatasetKind.Sections);
	// 		expect(result2).to.have.deep.members(["data", "data2"]);
	// 	});
	// 	it("adding a two datasets with same ids different case successfully", async function () {
	// 		await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
	// 		const result2 = await facade.addDataset("DATA", smallSet, InsightDatasetKind.Sections);
	// 		expect(result2).to.have.deep.members(["data", "DATA"]);
	// 	});
	// 	it("adding a single dataset that isnt a zip file", function () {
	// 		const invalidSections = getContentFromArchives("textFile.txt");
	// 		const result = facade.addDataset("data", invalidSections, InsightDatasetKind.Sections);
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("adding a single dataset no json data", function () {
	// 		const invalidSections = getContentFromArchives("nojson.zip");
	// 		const result = facade.addDataset("data", invalidSections, InsightDatasetKind.Sections);
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("adding a dataset with one valid and one invalid section successfully", async function () {
	// 		const invalidSections = getContentFromArchives("validninvalid.zip");
	// 		const result = await facade.addDataset("data", invalidSections, InsightDatasetKind.Sections);
	// 		expect(result).to.deep.equal(["data"]);
	// 	});
	// 	it("adding a single dataset no data at all", function () {
	// 		const invalidSections = getContentFromArchives("nodata.zip");
	// 		const result = facade.addDataset("data", invalidSections, InsightDatasetKind.Sections);
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("adding a single dataset with no valid courses", function () {
	// 		const invalidSections = getContentFromArchives("invalidcourse.zip");
	// 		const result = facade.addDataset("data", invalidSections, InsightDatasetKind.Sections);
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("adding a single dataset with no course folder", function () {
	// 		const invalidSections = getContentFromArchives("notincorrectfolder.zip");
	// 		const result = facade.addDataset("data", invalidSections, InsightDatasetKind.Sections);
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// });
	// describe("removeDataSet", () => {
	// 	beforeEach(function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	// 	it("removal should reject with  an id with an underscore", function () {
	// 		const result = facade.removeDataset("ubc_data");
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("removal should reject with  an id with whitespace", function () {
	// 		const result = facade.removeDataset(" ");
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	// 	it("removal should reject with an id that doesn't exist", function () {
	// 		const result = facade.removeDataset("data");
	// 		return expect(result).to.eventually.be.rejectedWith(NotFoundError);
	// 	});
	// 	it("successfully removes a dataset", async function () {
	// 		try {
	// 			await facade.addDataset("ubc", smallSet, InsightDatasetKind.Sections);
	// 			const result = await facade.removeDataset("ubc");
	// 			expect(result).equal("ubc");
	// 		} catch (err) {
	// 			expect.fail();
	// 		}
	// 	});
	// 	it("successfully removes correct dataset", async function () {
	// 		try {
	// 			await facade.addDataset("ubc", smallSet, InsightDatasetKind.Sections);
	// 			await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
	// 			await facade.addDataset("data2", smallSet, InsightDatasetKind.Sections);
	// 			const result = await facade.removeDataset("data");
	// 			expect(result).equal("data");
	// 		} catch (err) {
	// 			expect.fail();
	// 		}
	// 	});
	// });
	// describe("listdataset", () => {
	// 	beforeEach(function () {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 	});
	// 	it("should list one dataset", async function () {
	// 		// Setup
	// 		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	//
	// 		// Execution
	// 		const datasets = await facade.listDatasets();
	//
	// 		// Validation
	// 		expect(datasets).to.deep.equal([
	// 			{
	// 				id: "ubc",
	// 				kind: InsightDatasetKind.Sections,
	// 				numRows: 64612,
	// 			},
	// 		]);
	// 	});
	// 	it("should list two datasets", async function () {
	// 		// Setup
	// 		const data = getContentFromArchives("smalldataset.zip");
	// 		await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 		await facade.addDataset("ubc2", data, InsightDatasetKind.Sections);
	//
	// 		// Execution
	// 		const datasets = await facade.listDatasets();
	//
	// 		// Validation
	// 		expect(datasets).to.deep.equal([
	// 			{
	// 				id: "ubc",
	// 				kind: InsightDatasetKind.Sections,
	// 				numRows: 64612,
	// 			},
	// 			{
	// 				id: "ubc2",
	// 				kind: InsightDatasetKind.Sections,
	// 				numRows: 2,
	// 			},
	// 		]);
	// 	});
	// 	it("should list only show one dataset both ids are same", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("smalldataset.zip");
	// 			await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
	// 			await facade.addDataset("ubc", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([
	// 				{
	// 					id: "ubc",
	// 					kind: InsightDatasetKind.Sections,
	// 					numRows: 64612,
	// 				},
	// 			]);
	// 		}
	// 	});
	// 	it("should list no dataset because dataset id has underscore", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("smalldataset.zip");
	// 			await facade.addDataset("x_", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([]);
	// 		}
	// 	});
	// 	it("list nothing because id is empty", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("smalldataset.zip");
	// 			await facade.addDataset("", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([]);
	// 		}
	// 	});
	// 	it("list no dataset because id is whitespace", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("smalldataset.zip");
	// 			await facade.addDataset("   ", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.members([]);
	// 		}
	// 	});
	// 	it("list no dataset because invalid dataset", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("nodata.zip");
	// 			await facade.addDataset("data", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([]);
	// 		}
	// 	});
	// 	it("list show no dataset because invalid course dataset", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("invalidcourse.zip");
	// 			await facade.addDataset("data", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([]);
	// 		}
	// 	});
	// 	it("list no dataset because no json dataset", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("nojson.zip");
	// 			await facade.addDataset("data", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([]);
	// 		}
	// 	});
	// 	it("list no dataset because not in correct folder", async function () {
	// 		// Setup
	// 		try {
	// 			const data = getContentFromArchives("notincorrectfolder.zip");
	// 			await facade.addDataset("data", data, InsightDatasetKind.Sections);
	// 			expect.fail();
	// 		} catch (err) {
	// 			const datasets = await facade.listDatasets();
	// 			expect(datasets).to.deep.equal([]);
	// 		}
	// 	});
	// });
	describe("persistence", () => {
		it("persisted datasets added in new InsightFacade", async () => {
			clearDisk();
			facade = new InsightFacade();
			try {
				await facade.addDataset("data", smallSet, InsightDatasetKind.Sections);
				const withPersistedData: IInsightFacade = new InsightFacade();
				const datasets: InsightDataset[] = await withPersistedData.listDatasets();
				expect(datasets).to.deep.equal([
					{
						id: "data",
						kind: InsightDatasetKind.Sections,
						numRows: 2,
					},
				]);
			} catch (e) {
				console.log(e);
				expect.fail("should not have thrown error");
			}
		});
	});
	// describe("performQuery", async () => {
	// 	let secondaryData: string;
	// 	before(async () => {
	// 		clearDisk();
	// 		facade = new InsightFacade();
	// 		secondaryData = getContentFromArchives("smalldataset.zip");
	// 		await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
	// 		await facade.addDataset("data", sections, InsightDatasetKind.Sections);
	// 	});
	// 	type Error = "InsightError" | "ResultTooLargeError";
	// 	type Output = any[];
	// 	type Input = any;
	// 	function errorValidator(error: any): error is Error {
	// 		return error === "ResultTooLargeError" || error === "InsightError";
	// 	}
	//
	// 	function assertOnError(actual: any, expected: Error): void {
	// 		if (expected === "InsightError") {
	// 			expect(actual).to.be.instanceof(InsightError);
	// 		} else if (expected === "ResultTooLargeError") {
	// 			expect(actual).to.be.instanceof(ResultTooLargeError);
	// 		} else {
	// 			// this should be unreachable
	// 			expect.fail("UNEXPECTED ERROR");
	// 		}
	// 	}
	//
	// 	function assertOnResult(actual: unknown, expected: Output): void {
	// 		expect(actual).to.have.deep.members(expected);
	// 	}
	//
	// 	it("passing non json to peformQuery", function () {
	// 		const result = facade.performQuery("randomstuff");
	// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
	// 	});
	//
	// 	folderTest<Input, Output, Error>(
	// 		"Add Dynamic queries for perform query",
	// 		(input) => facade.performQuery(input),
	// 		"./test/resources/queries/courses",
	// 		{
	// 			errorValidator,
	// 			assertOnError,
	// 			assertOnResult,
	// 		}
	// 	);
	// });
}
