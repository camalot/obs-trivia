'use strict';

const xconfig = require('../../config');
const merge = require('merge');

let config = {
	'auth/auth': {
		route: ['/auth']
	}

};

module.exports = merge(xconfig, config);
