"use strict";

module.exports = {
	slug: (s) => {
		return s
			.replace(/\s/gi, "-")
			.trim()
			.toLowerCase();
	},
	safeChannel: (channel) => {
		return channel.replace(/^\#/, '');
	},
	plural: (count) => {
		return count === 1 ? '' : 's';
	}
};
