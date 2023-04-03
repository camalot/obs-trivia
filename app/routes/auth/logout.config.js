'use strict';

const xconfig = require('../../config');
const merge = require('merge');

let config = {
	'auth/logout': {
		route: ['/logout', '/auth/logout']
	}

};

module.exports = merge(xconfig, config);
