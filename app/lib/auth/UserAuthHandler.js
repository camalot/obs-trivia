"use strict";

const bot = require('../database/bot');
const merge = require('merge');

function UserAuthHandler(accessToken, refreshToken, profile, done) {
	if (profile && profile.username) {
		return bot.join(profile.username)
			.then((result) => {
				let data = merge(profile._json, {});
				delete data._id;
				delete data._raw;
				delete data.display_name;
				data = merge(data, profile);
				delete data._raw;
				delete data._json;
				console.log(data);
				return done(null, data);
			})
			.catch(err => {
				console.error(err);
				return done(err);
			});
	} else {
		return new Promise((resolve, reject) => {
			return reject("profile is empty");
		});
	}
}

module.exports = UserAuthHandler;
