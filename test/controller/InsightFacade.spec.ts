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
import roomTests from "./InsightFacadeRoom.spec";
import sectionTests from "./InsightFacadeSection.spec";


chai.use(chaiAsPromised);
describe("InsightFacade tests", function () {
	describe("Section tests", sectionTests.bind(this));
	describe("Room tests", roomTests.bind(this));
});
