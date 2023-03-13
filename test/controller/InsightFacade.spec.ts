import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import roomTests from "./InsightFacadeRoom.spec";
import sectionTests from "./InsightFacadeSection.spec";
import SectionTestsKennyPerformQuery from "./SectionTestsKenny - performQuery.spec";
import SectionTestsKenny from "./SectionTestsKenny.spec";


chai.use(chaiAsPromised);
describe("InsightFacade tests", function () {
	describe("Section tests", sectionTests.bind(this));
	describe("Room tests", roomTests.bind(this));
	describe("Section tests - Kenny", SectionTestsKenny.bind(this));
	describe("Section tests performQuery - Kenny", SectionTestsKennyPerformQuery.bind(this));
});
