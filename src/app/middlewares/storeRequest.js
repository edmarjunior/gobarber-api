const get_ip = require('ipware')().get_ip;
import Request from "../models/Request";

export default async (req, res, next) => {
	const { clientIp: client_ip } = get_ip(req);
	const { url, method, params, query, body } = req;

	await Request.create({
		client_ip,
		url,
		method,
		params: JSON.stringify(params),
		query: JSON.stringify(query),
		body: JSON.stringify(body)
	});

	return next();
}
