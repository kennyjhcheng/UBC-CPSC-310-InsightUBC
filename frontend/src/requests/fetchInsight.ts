import path from "path";

const SERVER_ADDRESS = "http://localhost:4321";

/**
 * @param {string} httpMethod one of 'GET', 'POST', 'DELETE', 'PUT'
 * @param {string} url
 * @param {string} body as json string created from JSON.stringify()
 */
export const fetchInsight = async (httpMethod: string, uri: string, body: string) => {
	try {
		const response = await window.fetch(path.join(SERVER_ADDRESS, uri),
			{
				method: httpMethod,
				headers: {
					'content-Type': 'application/json',
				},
				body: body,
			});
		const jsonData = await response.json();
		return jsonData;
	} catch (e) {
		console.log(e)
	}
};
