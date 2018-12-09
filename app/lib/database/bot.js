"use strict";

const MongoDatabase = require("../MongoDatabase");
const config = require('../../config');
const dbconfig = config.mongodb;
const DATABASE_NAME = dbconfig.DATABASE;
const COLLECTION_NAME = "channels";
const merge = require('merge');
const utils = require('../utils');
const stringUtils = utils.string;
const async = require('async');

let _all = () => {
	return new Promise((resolve, reject) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.select(COLLECTION_NAME)
			.then(data => {
				return async.map(data, (item, next) => {
					return next(null, item.id);
				}, (err, results) => {
					if(err) {
						console.error(err);
						return reject(err);
					}
					return resolve(results);
				});
			})
			.catch(err => {
				console.error(err);
				return reject(err);
			});
	});

};

let _get = (channel) => {
	channel = stringUtils.safeChannel(channel);
	let mongodb = new MongoDatabase(DATABASE_NAME);
	return mongodb.get(COLLECTION_NAME, { id: channel });
};

let _join = (channel) => {
	channel = stringUtils.safeChannel(channel);
	return new Promise((resolve, reject) => {
		return _get(channel)
			.then((data) => {
				if (data) {
					return resolve(data);
				} else {
					let mongodb = new MongoDatabase(DATABASE_NAME);
					return mongodb.insert(COLLECTION_NAME, { id: channel })
						.then((d) => resolve(d))
						.catch(err => reject(err));
				}
			})
			.catch(err => {
				console.error(err);
				return reject(err);
			});
	});
};

let _part = (channel) => {
	channel = stringUtils.safeChannel(channel);
	return new Promise((resolve, reject) => {
		return _get(channel)
			.then((data) => {
				if (data) {
					let mongodb = new MongoDatabase(DATABASE_NAME);
					return mongodb.delete(COLLECTION_NAME, { id: channel })
						.then(() => resolve(data))
						.catch(err => reject(err));
				} else {
					return resolve(null);
				}
			})
			.catch(err => {
				console.error(err);
				return reject(err);
			});
	});
}


module.exports = {
	init: () => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	},
	all: _all,
	get: _get,
	join: _join,
	part: _part
};
