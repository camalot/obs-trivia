'use strict';

let _handle = (chat) => {
	const fs = require("fs");
	const path = require("path");
	const normalizedPath = path.join(__dirname, "./");

	let libs = {};
	fs.readdirSync(normalizedPath).forEach((file) => {
		let configMatch = /.*?\.config\.js/i;
		if (file !== 'index.js' && file !== 'config.js' && !configMatch.test(file)) {
			let name = file.substring(0, file.lastIndexOf('.'));
			let inst = require("./" + name);
			libs[name] = new inst(chat);
		}
	});
	return libs;
};

module.exports = _handle;
