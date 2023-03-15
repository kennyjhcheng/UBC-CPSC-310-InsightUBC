import InsightFacade from "../../src/controller/InsightFacade";
import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {folderTest} from "@ubccpsc310/folder-test";
import {before} from "mocha";
import {
	expectedPassGroupAPPLYMAXSEATS,
	queryPassApplyOrderString,
	queryPassGroupAPPLYMAXSEATS,
} from "./../InsightFacadeOrderUtil";
import {queryPassApplyOrderUP, expectedPassApplyOrderString} from "./../InsightFacadeOrderUtil2";
import {queryPassORDERDOWNSINGLEKEY, expectedPassORDERDOWNSINGLEKEY} from "./../InsightFacadeOrderUtil4";
import {
	expectedPassApplyOrderUP,
	queryPassORDERDOWNMULTIKEY,
	expectedPassORDERDOWNMULTIKEY
} from "./../InsightFacadeOrderUtil3";

chai.use(chaiAsPromised);
function compareOrder(actual: InsightResult[], expected: InsightResult[], keys: string[]) {
	expect(actual).is.an.instanceOf(Array);
	expect(actual.length).is.equals(expected.length);
	for (let i = 0; i < actual.length; i++) {
		for (let key of keys) {
			expect(actual[i][key]).is.equals(expected[i][key]);
		}
	}
}

/**
 * Tests for new ORDER EBNF
 */
export default function OrderPerformQueryTests() {
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
			expect(actual).to.have.deep.equals(expected);
		}

		folderTest<Input, Output, Error>(
			"Add Dynamic queries for perform query",
			(input) => facade.performQuery(input),
			"./test/resources/queries/order",
			{
				errorValidator,
				assertOnError,
				assertOnResult,
			}
		);

		it("pass_apply_orderString", async function () {
			let results = await facade.performQuery(queryPassApplyOrderString);
			compareOrder(results, expectedPassApplyOrderString, ["maxSeats"]);
		});

		it("pass_apply_orderUP", async function () {
			let results = await facade.performQuery(queryPassApplyOrderUP);
			compareOrder(results, expectedPassApplyOrderUP, ["maxSeats"]);
		});

		it("pass_GROUP_APPLY_MAX_SEATS", async function () {
			let results = await facade.performQuery(queryPassGroupAPPLYMAXSEATS);
			compareOrder(results, expectedPassGroupAPPLYMAXSEATS, ["maxSeats"]);
		});

		it("pass_ORDER_DOWN_MULTIKEY", async function () {
			let results = await facade.performQuery(queryPassORDERDOWNMULTIKEY);
			compareOrder(results, expectedPassORDERDOWNMULTIKEY,
				["rooms_shortname",
					"rooms_number",
					"rooms_name"]);
		});

		it("pass_ORDER_DOWN_SINGLEKEY", async function () {
			let results = await facade.performQuery(queryPassORDERDOWNSINGLEKEY);
			compareOrder(results, expectedPassORDERDOWNSINGLEKEY, ["rooms_shortname"]);
		});
	});
}
