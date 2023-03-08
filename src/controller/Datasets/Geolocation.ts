import * as http from "http";
import {IGeoResponse} from "./IGeolocation";

export default class Geolocation {


	private static readonly GEOLOCATION_ADDRESS = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team109/";

	/**
	 * returns promised tuple [lon, lat] given address
	 * @param address
	 */
	public static async getLonLat(address: string): Promise<IGeoResponse> {
		const httpAddress: string = this.GEOLOCATION_ADDRESS + encodeURIComponent(address);
		return new Promise((resolve, reject) => {
			http.get(httpAddress, (res) => {
				const {statusCode} = res;
				let error;
				if (!(statusCode && statusCode >= 200 && statusCode < 300)) {
					error = new Error("Request Failed.\n" +
						`Status Code: ${statusCode}`);
				}

				if (error) {
					console.error(error.message);
					// Consume response data to free up memory
					res.resume();
					reject("Error getting address");
				}

				res.setEncoding("utf8");
				let rawData = "";
				res.on("data", (chunk) => {
					rawData += chunk;
				});
				res.on("end", () => {
					try {
						const parsedData = JSON.parse(rawData) as IGeoResponse;
						resolve(parsedData);
					} catch (e: any) {
						console.error(e.message);
					}
				});
			});
		});
	}
};
