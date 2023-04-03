'use strict';

const xconfig = require('../../config');
const merge = require('merge');

let config = {
	'auth/login': {
		route: ['/login', '/auth/login']
	}

};

module.exports = merge(xconfig, config);
