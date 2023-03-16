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
import RoomPerformQueryTests from "./InsightFacadeRoomPerformQuery.spec";
import OrderAndTransformationPerformQueryTests from "./InsightFacadeOrderAndTransformationPerformQuery.spec";
import OrderPerformQueryTests from "./InsightFacadeOrder.spec";


chai.use(chaiAsPromised);
describe("InsightFacade tests", function () {
	describe("Section tests", sectionTests.bind(this));
	describe("Room tests", roomTests.bind(this));
	describe("Room Perform Query tests", RoomPerformQueryTests.bind(this));
	describe("Perform Query - Order and Transformation tests", OrderAndTransformationPerformQueryTests.bind(this));
	describe("Perform Query - Order Tests", OrderPerformQueryTests.bind(this));
});
