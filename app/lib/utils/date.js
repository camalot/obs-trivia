"use strict";

let _utc = () => {
	let date = new Date();
	let now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
		date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
	return now_utc;
};

module.exports = {
	utc: _utc
};
