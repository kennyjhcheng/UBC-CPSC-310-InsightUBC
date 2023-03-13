import InsightFacade from "../../src/controller/InsightFacade";
import {InsightDatasetKind, InsightError, ResultTooLargeError,} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {folderTest} from "@ubccpsc310/folder-test";
import {before} from "mocha";

/**
 * Tests for new ORDER EBNF and Transformations
 */
chai.use(chaiAsPromised);
export default function OrderAndTransformationPerformQueryTests() {
	let rooms: string;
	let sections: string;
	let facade: InsightFacade;

	before(function () {
		rooms = getContentFromArchives("rooms.zip");
		sections = getContentFromArchives("pair.zip");
	});
	describe("performQuery - order and transformation tests", async () => {
		before(async () => {
			clearDisk();
			facade = new InsightFacade();
			await facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms);
			await facade.addDataset("sections", sections, InsightDatasetKind.Sections);
		});
		type Error = "InsightError" | "ResultTooLargeError";
		type Output = any[];
		type Input = any;
		function errorValidator(error: any): error is Error {
			return error === "ResultTooLargeError" || error === "InsightError";
		}

		function assertOnError(actual: any, expected: Error): void {
			if (expected === "InsightError") {
				expect(actual).to.be.instanceof(InsightError);
			} else if (expected === "ResultTooLargeError") {
				expect(actual).to.be.instanceof(ResultTooLargeError);
			} else {
				// this should be unreachable
				expect.fail("UNEXPECTED ERROR");
			}
		}

		function assertOnResult(actual: unknown, expected: Output): void {
			expect(actual).to.have.deep.members(expected);
		}

		folderTest<Input, Output, Error>(
			"Add Dynamic queries for perform query",
			(input) => facade.performQuery(input),
			"./test/resources/queries/orderAndTransformation",
			{
				errorValidator,
				assertOnError,
				assertOnResult,
			}
		);
	});
}
