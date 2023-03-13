import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import roomTests from "./InsightFacadeRoom.spec";
import sectionTests from "./InsightFacadeSection.spec";
import RoomPerformQueryTests from "./InsightFacadeRoomPerformQuery.spec";
import OrderAndTransformationPerformQueryTests from "./InsightFacadeOrderAndTransformationPerformQuery.spec";


chai.use(chaiAsPromised);
describe("InsightFacade tests", function () {
	describe("Section tests", sectionTests.bind(this));
	describe("Room tests", roomTests.bind(this));
	describe("Room Perform Query tests", RoomPerformQueryTests.bind(this));
	describe("Perform Query - Order and Transformation tests", OrderAndTransformationPerformQueryTests.bind(this));
});
