import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";

describe("Server", () => {

	let facade: InsightFacade;
	let server: Server;
	const SERVER_URL = "http://localhost:4321";

	before(async () => {
		facade = new InsightFacade();
		server = new Server(4321);
		server.start().then(() => {
			console.info("App::initServer() - started");
		}).catch((err: Error) => {
			console.error(`App::initServer() - ERROR: ${err.message}`);
		});
	});

	after(async () => {
		server.start().then(() => {
			console.info("App::terminateServer() - stopped");
		}).catch((err: Error) => {
			console.error(`App::terminateServer() - ERROR: ${err.message}`);
		});
	});

	beforeEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	 */
	// it("PUT test for add courses dataset", async () => {
	//
	// 	try {
	// 		return request(SERVER_URL)
	// 			.put(ENDPOINT_URL)
	// 			.send(ZIP_FILE_DATA)
	// 			.set("Content-Type", "application/x-zip-compressed")
	// 			.then((res: Response) => {
	// 				expect(res.status).to.be.equal(200);
	// 				// more assertions here
	// 			})
	// 			.catch((err) => {
	// 				// some logging here please!
	// 				expect.fail();
	// 			});
	// 	} catch (err) {
	// 		// and some more logging here!
	// 	}
	// });

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
