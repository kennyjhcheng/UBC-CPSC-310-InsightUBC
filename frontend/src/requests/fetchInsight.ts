/**
 * @param {string} httpMethod one of 'GET', 'POST', 'DELETE', 'PUT'
 * @param {string} url
 * @param {string} body as json string created from JSON.stringify()
 */
export const fetchInsight = async (httpMethod: String, url: String, body: string) => {
	// const requestOptions = {
	// 	method: httpMethod,
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: ""
	// };
	//
	// if (httpMethod != 'GET') requestOptions.body = body;
	// try {
	// 	const response = await fetch(url, requestOptions);
	// 	const jsonData = await response.json();
	// 	return jsonData;
	// } catch (e) {
	// 	console.log(e);
	// }
};
