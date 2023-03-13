import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import chai, {expect} from "chai";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import {folderTest} from "@ubccpsc310/folder-test";
import InsightFacade from "../../src/controller/InsightFacade";
import {afterEach} from "mocha";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
type FolderTestInput = unknown;
type FolderTestError = "ResultTooLargeError" | "InsightError";
export default function SectionTestsKennyPerformQuery() {

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

	before(async function() {
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

		insightFacade = new InsightFacade();
		await insightFacade.addDataset("sections", pair, InsightDatasetKind.Sections);
	});

	beforeEach(function() {
		clearDisk();
		facade = new InsightFacade();
	});

	afterEach(function() {
		clearDisk();
	});

	after(function () {
		clearDisk();
	});

	describe("performQuery manual tests", function() {
		it("fail ORDER typo", async () => {
			let query = {
				WHERE: {
					AND: [
						{
							LT: {
								sections_fail: 10
							}
						},
						{
							GT: {
								sections_pass: 200
							}
						}
					]
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_instructor",
						"sections_title",
						"sections_avg"
					],
					ORDR: "sections_avg"
				}
			};
			try {
				await insightFacade.performQuery(query);
				expect.fail("should not continue");
			} catch (e) {
				expect(e).to.be.an.instanceOf(InsightError);
			}
		});

		it("fail wildcard RESULTTOOMANY error", async () => {
			let query = {
				WHERE: {
					IS: {
						sections_uuid: "*"
					}
				},
				OPTIONS: {
					COLUMNS: [
						"sections_dept",
						"sections_instructor",
						"sections_title",
						"sections_avg",
						"sections_id",
						"sections_title"
					],
					ORDER: "sections_avg"
				}
			};
			try {
				await insightFacade.performQuery(query);
				expect.fail("should not continue");
			} catch (e) {
				expect(e).to.be.an.instanceOf(ResultTooLargeError);
			}
		});


	});

	function assertResult(actual: unknown, expected: InsightResult[]): void {
		/** Source https://medium.com/building-ibotta/testing-arrays-and-objects-with-chai-js-4b372310fe6d **/
		expect(actual).to.deep.members(expected);
	}

	function assertError(actual: unknown, expected: FolderTestError): void {
		if (expected === "ResultTooLargeError") {
			expect(actual).to.be.an.instanceOf(ResultTooLargeError);
		} else {
			expect(actual).to.be.an.instanceOf(InsightError);
		}
	}

	function errorValidator(error: any): error is FolderTestError {
		return error === "ResultTooLargeError" || error === "InsightError";
	}

	function target(input: FolderTestInput) {
		return insightFacade.performQuery(input);
	}

	folderTest<unknown, InsightResult[], FolderTestError>(
		"performQuery folderTests",
		target,
		"./test/resources/performQuery-folderTest-Kenny",
		{
			assertOnResult: assertResult,
			assertOnError: assertError,
			errorValidator: errorValidator,
		}
	);
}
