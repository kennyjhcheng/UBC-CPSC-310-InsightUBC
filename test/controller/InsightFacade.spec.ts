import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with  an id with an underscore", function () {
			const result = facade.addDataset(
				"ubc_data",
				sections,
				InsightDatasetKind.Sections
			);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with  an id with just white spaces", function () {
			const result = facade.addDataset(
				"  ",
				sections,
				InsightDatasetKind.Sections
			);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with because of room type", function () {
			const result = facade.addDataset(
				"someid",
				sections,
				InsightDatasetKind.Rooms
			);

			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("dataset failing because added twice", async function () {
			try {
				const result = await facade.addDataset(
					"data",
					sections,
					InsightDatasetKind.Sections
				);
				const result2 = await facade.addDataset(
					"data",
					sections,
					InsightDatasetKind.Sections
				);
				expect.fail();
			} catch (err) {
				expect(err).be.instanceOf(InsightError);
			}
		});
		it("adding a single dataset successfully", async function () {
			const result: string[] = await facade.addDataset(
				"data",
				sections,
				InsightDatasetKind.Sections
			);
			expect(result).to.deep.equal(["data"]);
		});
		it("adding a two datasets with different ids successfully", async function () {
			const result: string[] = await facade.addDataset(
				"data",
				sections,
				InsightDatasetKind.Sections
			);
			const result2 = await facade.addDataset(
				"data2",
				sections,
				InsightDatasetKind.Sections
			);
			expect(result2).to.have.deep.members(["data", "data2"]);
		});
		it("adding a two datasets with same ids different case successfully", async function () {
			const result: string[] = await facade.addDataset(
				"data",
				sections,
				InsightDatasetKind.Sections
			);
			const result2 = await facade.addDataset(
				"DATA",
				sections,
				InsightDatasetKind.Sections
			);
			expect(result2).to.have.deep.members(["data", "DATA"]);
		});
		it("adding a single dataset that isnt a zip file", function () {
			const invalidSections = getContentFromArchives("textFile.txt");
			const result = facade.addDataset(
				"data",
				invalidSections,
				InsightDatasetKind.Sections
			);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("adding a single dataset no json data", function () {
			const invalidSections = getContentFromArchives("nojson.zip");
			const result = facade.addDataset(
				"data",
				invalidSections,
				InsightDatasetKind.Sections
			);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("adding a single dataset no data at all", function () {
			const invalidSections = getContentFromArchives("nodata.zip");
			const result = facade.addDataset(
				"data",
				invalidSections,
				InsightDatasetKind.Sections
			);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("adding a single dataset with no valid courses", function () {
			const invalidSections = getContentFromArchives("invalidcourse.zip");
			const result = facade.addDataset(
				"data",
				invalidSections,
				InsightDatasetKind.Sections
			);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("adding a single dataset with no course folder", function () {
			const invalidSections = getContentFromArchives("notincorrectfolder.zip");
			const result = facade.addDataset(
				"data",
				invalidSections,
				InsightDatasetKind.Sections
			);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					// TODO add an assertion!
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					// TODO add an assertion!
				},
			}
		);
	});
});
