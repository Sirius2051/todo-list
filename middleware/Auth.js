// middleware/auth.js
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

function auth(req, res, next) {
	const cookies = cookie.parse(req.headers.cookie || '');
	const token = cookies.token;
	if (!token) {
		res.writeHead(302, { 'Location': '/login' });
		res.end();
		return;
	}
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.writeHead(400, { 'Content-Type': 'text/plain' });
		res.end('Token inválido');
	}
}

module.exports = auth;