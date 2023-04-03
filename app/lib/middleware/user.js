"use strict";
const merge = require('merge');

module.exports = (req, res, next) => {
	if (req.user) {
		res.locals.user = merge(req.user ? {} : null, req.user);
	} else {
		res.locals.user = null;
	}

	req.user = res.locals.user;
	return next();
};
