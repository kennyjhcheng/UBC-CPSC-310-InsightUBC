import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import Geolocation from "../../src/controller/Datasets/Geolocation";
import {IGeoResponse} from "../../src/controller/Datasets/IGeolocation";


chai.use(chaiAsPromised);

export default function GeolocationTests() {
	it("Query success", async function () {
		const queryAddress = "2211 Wesbrook Mall";
		try {
			const res = await Geolocation.getLonLat(queryAddress);
			console.log(res);
			expect(res).to.deep.equal({lat: 49.26408, lon: -123.24605} as IGeoResponse);
		} catch (e) {
			console.error(e);
			expect.fail();
		}

	});
}
