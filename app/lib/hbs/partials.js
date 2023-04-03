'use strict';
const fs = require('fs');
const path = require('path');
const normalizedPath = path.join(__dirname, "../../views/partials/");

let hbs = require('hbs');

let registeredPartials = {};
fs.readdirSync(normalizedPath).forEach(file => {
	let match = /(.*?)\.hbs$/i;
	if (match.test(file)) {
		let fullPath = path.join(normalizedPath, file);
		let name = file
			.substring(0, file.lastIndexOf("."));
		let data = fs.readFileSync(fullPath, { encoding: 'utf-8' });
		console.log("register partial: " + name);
		hbs.registerPartial(name, data);
		registeredPartials[name] = fullPath;
	}
});

module.exports = registeredPartials;
