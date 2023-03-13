import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import chai, {expect} from "chai";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import InsightFacade from "../../src/controller/InsightFacade";
import chaiAsPromised from "chai-as-promised";
import {afterEach} from "mocha";
import {folderTest} from "@ubccpsc310/folder-test";

chai.use(chaiAsPromised);

export default function SectionTestsKenny()  {
	/** datasets **/
	let pair: string;
	let smallPair: string;
	let empty: string;
	let emptyJson: string;
	let picture: string;
	let invalidJson: string;
	let invalidNonJsonFiles: string;
	let invalidSectionsMissingFields: string;
	let jsonNotInCoursesDir: string;
	let mispelledCourses: string;
	let noCoursesDir: string;
	let nonZipFile: string;

	/** controller **/
	let facade: InsightFacade;
	let insightFacade: InsightFacade;

	before(function() {
		clearDisk();
		pair = getContentFromArchives("pair.zip");
		smallPair = getContentFromArchives("smallPair.zip");
		empty = getContentFromArchives("empty.zip");
		emptyJson = getContentFromArchives("empty_json.zip");
		picture = getContentFromArchives("picture.zip");
		invalidJson = getContentFromArchives("invalid_json.zip");
		invalidNonJsonFiles = getContentFromArchives("invalid_non_json_files.zip");
		invalidSectionsMissingFields = getContentFromArchives("invalid_sections_missing_field.zip");
		jsonNotInCoursesDir = getContentFromArchives("json_not_in_course_dir.zip");
		mispelledCourses = getContentFromArchives("mispelled_courses.zip");
		noCoursesDir = getContentFromArchives("no_courses_dir.zip");
		nonZipFile = getContentFromArchives("AANB504");
	});

	beforeEach(function() {
		clearDisk();
		facade = new InsightFacade();
	});

	afterEach(function() {
		clearDisk();
	});

	describe("addDataset", function() {
		it("pass -> normal data set with correct params", function() {
			const result = facade.addDataset("test", smallPair, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.an("array")
				.to.have.length(1)
				.to.include("test");
		});

		it("pass -> multiple data sets added with different params", function() {
			const res = facade.addDataset("test1", smallPair, InsightDatasetKind.Sections)
				.then((ids) => {
					return facade.addDataset("test2", smallPair, InsightDatasetKind.Sections);
				});

			return expect(res).to.eventually.be.an("array")
				.to.have.length(2)
				.to.include("test2").to.include("test1");
		});

		it ("should reject ->  an empty dataset id", function() {
			const result = facade.addDataset("", smallPair, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject -> underscore in dataset id", function() {
			const result = facade.addDataset("test_hello", smallPair, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject -> whitespace dataset id", function() {
			const result = facade.addDataset("   ", smallPair, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject -> second dataset id added with same id as first dataset", function() {
			const resultError = facade.addDataset("test", smallPair, InsightDatasetKind.Sections)
				.then((ids) => {
					return facade.addDataset("test", smallPair, InsightDatasetKind.Sections);
				});

			return expect(resultError).to.eventually.be.rejectedWith(InsightError);
		});

		it ("should reject -> invalid InsightDatasetKind rooms", function() {
			const result = facade.addDataset("test", smallPair, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid b64 zip content, empty", function() {
			const result = facade.addDataset("test", empty, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid b64 zip content, empty json", function() {
			const result = facade.addDataset("test", emptyJson, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid b64 zip content, picture in zip", function() {
			const result = facade.addDataset("test", picture, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> courses directory mispelled", function() {
			const result = facade.addDataset("test", mispelledCourses, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid json ", function() {
			const result = facade.addDataset("test", invalidJson, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid nonjson files ", function() {
			const result = facade.addDataset("test", invalidNonJsonFiles, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> no course dir ", function() {
			const result = facade.addDataset("test", noCoursesDir, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> non-zip file loaded ", function() {
			const result = facade.addDataset("test", nonZipFile, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> json not in course dir ", function() {
			const result = facade.addDataset("test", jsonNotInCoursesDir, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid sections missing field", function() {
			const result = facade.addDataset("test", invalidSectionsMissingFields, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejected;
		});
	});

	describe("removeDataset", function() {
		beforeEach(async function() {
			try {
				await facade.addDataset("test", smallPair, InsightDatasetKind.Sections);
			} catch (e) {
				expect.fail("should not fail add in beforeEach");
			}

		});

		it("should pass -> successful removal, no errors", async function() {
			try {
				await facade.removeDataset("test");
			} catch (err) {
				expect.fail("should not fail removal: " + err);
			}
		});

		it("should pass -> return id", async function() {
			try {
				const res = await facade.removeDataset("test");
				expect(res).to.be.equal("test");
			} catch (err) {
				expect.fail("should not fail removal: " + err);
			}
		});

		it("should pass -> removing dataset only removes one dataset", async function() {
			try {
				await facade.addDataset("test2", smallPair, InsightDatasetKind.Sections);
				const result = await facade.removeDataset("test");

				expect(result).to.be.equal("test");

				const listAfterRemove = await facade.listDatasets();
				expect(listAfterRemove).to.be.an("array")
					.length(1)
					.deep.members([
						{
							id: "test2",
							kind: InsightDatasetKind.Sections,
							numRows: 17,
						}
					]);
			} catch (err) {
				expect.fail("should not fail: " + err);
			}
		});

		it("should reject -> remove dataset that hasn't been added -> NotFoundError", function() {
			const result = facade.removeDataset("nothing");
			return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should reject -> invalid id - underscore -> InsightError", function() {
			const result = facade.removeDataset("test_bad");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject -> invalid id - only whitespace -> InsightError", function() {
			const result = facade.removeDataset("   ");
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});

	describe("listDatasets", function() {

		it("pass -> Empty, no datasets", function() {
			const result = facade.listDatasets();
			return expect(result).to.eventually.be.an("array").that.is.empty;
		});

		it("pass -> One data set", function() {
			const result = facade.addDataset("test", smallPair, InsightDatasetKind.Sections)
				.then((ids) => {
					return facade.listDatasets();
				}).catch((e) => {
					expect.fail("should not fail: " + e);
				});
			return expect(result).to.eventually.be.an("array").length(1)
				.deep.equal([{
					id: "test",
					kind: InsightDatasetKind.Sections,
					numRows: 17,
				}]);
		});

		it("pass -> multiple datasets", function() {
			const result = facade.addDataset("test", smallPair, InsightDatasetKind.Sections)
				.then((ids) => {
					return facade.addDataset("test2", smallPair, InsightDatasetKind.Sections);
				}).then((ids) => {
					return facade.listDatasets();
				}).catch((e) => {
					expect.fail("should not fail: " + e);
				});
			return expect(result).to.eventually.be.an("array").length(2)
				.deep.equal([{
					id: "test",
					kind: InsightDatasetKind.Sections,
					numRows: 17,
				}, {
					id: "test2",
					kind: InsightDatasetKind.Sections,
					numRows: 17,
				}]);
		});
	});
}
