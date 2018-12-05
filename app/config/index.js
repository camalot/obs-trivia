"use strict";
const merge = require("merge");
let outConfig = {};

const normalizedPath = require("path").join(__dirname, "./");
require("fs")
	.readdirSync(normalizedPath)
	.forEach(function (file) {
		var configMatch = /.*?\.config\.js/i;
		if (
			file !== "index.js" &&
			file !== "config.js" &&
			configMatch.test(file)
		) {
			console.log(file);
			outConfig = merge(outConfig, require("./" + file));
		}
	});

let result = merge({}, outConfig);
module.exports = result;
