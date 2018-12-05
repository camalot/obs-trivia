"use strict";

function FileNotFoundHandler(message, status) {
	return (req, res, next) => {
		if (!message) {
			message = "Page Not Found";
		}
		let err = new Error(message);
		err.status = status || 404;
		res.locals.errorView = "404";
		return next(err);
	};
}

module.exports = FileNotFoundHandler;
