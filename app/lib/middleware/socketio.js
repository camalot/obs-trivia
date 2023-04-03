"use strict";

module.exports = (socket) => {
	return (req, res, next) => {
		res.locals.io = socket;
		return next();
	};
};
