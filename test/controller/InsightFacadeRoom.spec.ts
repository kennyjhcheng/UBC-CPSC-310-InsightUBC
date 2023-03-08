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
import * as fs from "fs-extra";


chai.use(chaiAsPromised);

export default function roomTests() {
	let facade: InsightFacade;
	let rooms: string;
	let sections: string;

	before(function () {
		rooms = getContentFromArchives("rooms.zip");
		sections = getContentFromArchives("smalldataset.zip");
	});

	describe("Add Room dataset", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});

		// This is a unit test. You should create more like this!
		it("adds room", async function () {
			const result: string[] = await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);
			expect(result).to.deep.equal(["data"]);
		});

		it("InsightError - underscore", function () {
			const result = facade.addDataset("under_score", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("InsightError - only underscores", function () {
			const result = facade.addDataset("__", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("InsightError - whitespace", async function () {
			const result = facade.addDataset("  ", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("InsightError - duplicate id", async function () {
			try {
				await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);
				await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);
			} catch (e) {
				expect(e).to.be.an.instanceof(InsightError);
			}
			;
		});

		it("InsightError - not zip file, txt file", function () {
			const invalidSections = getContentFromArchives("textFile.txt");
			const result = facade.addDataset("data", invalidSections, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("two datasets, different ids", async function () {
			await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);
			const result2 = await facade.addDataset("DATA", rooms, InsightDatasetKind.Rooms);
			expect(result2).to.have.deep.members(["data", "DATA"]);
		});
	});

	describe("remove room dataset", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});
		it("add and remove", async function () {
			try {
				await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);
				await facade.removeDataset("data");
			} catch (e) {
				expect.fail("should pass");
			}
		});

		it("should only remove the dataset with matching id", async function () {
			try {
				await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);
				await facade.addDataset("data2", rooms, InsightDatasetKind.Rooms);
				await facade.addDataset("data3", rooms, InsightDatasetKind.Rooms);
				const result = await facade.removeDataset("data2");
				expect(result).equal("data2");
			} catch (e) {
				expect.fail("should have passed");
			}
		});
	});

	describe("list room dataset", function () {
		beforeEach(function () {
			clearDisk();
			facade = new InsightFacade();
		});
		it("list no datasets", async function () {
			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([
			]);
		});

		it("list one rooms set", async function () {
			await facade.addDataset("data", rooms, InsightDatasetKind.Rooms);

			const datasets = await facade.listDatasets();

			expect(datasets).to.deep.equal([
				{
					id: "data",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
			]);
		});

		it("list room + section dataset", async function() {
			await facade.addDataset("room", rooms, InsightDatasetKind.Rooms);
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
			const datasets = await facade.listDatasets();
			expect(datasets).to.deep.members([
				{
					id: "room",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
				{
					id: "sections",
					kind: InsightDatasetKind.Sections,
					numRows: 2,
				},
			]);
		});
	});
}
