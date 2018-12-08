"use strict";

const MongoDatabase = require("../MongoDatabase");
const config = require('../../config');
const dbconfig = config.mongodb;
const DATABASE_NAME = dbconfig.DATABASE;
const COLLECTION_NAME = "points";
const merge = require('merge');
const utils = require('../utils');
const stringUtils = utils.string;
const shortid = require('shortid');
const async = require('async');

module.exports = {
	init: () => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	},
	all: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.select(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) });
	},
	count: (channel, username) => {
		return new Promise((resolve, reject) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		mongodb.select(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), username: username })
			.then((data) => {
				return resolve(data ? data.length : 0);
			})
			.catch(err => {
				console.error(err);
				return reject(err);
			});
		});
	},
	totals: (channel) => {
		return new Promise((resolve, reject) => {
			let mongodb = new MongoDatabase(DATABASE_NAME);
			return mongodb.select(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) })
				.then((data) => {
					let users = [];
					let result = {};
					data.reduce((prev, cur) => {
						if (users.indexOf(cur.username) === -1) {
							users.push(cur.username);
						}
					}, users);

					async.each(users, (item, next) => {
						result[item] = data.reduce((prev, cur) => {
							if (cur.username === item) {
								return prev + cur.points;
							} else {
								return prev;
							}
						}, 0);
						next();
					}, (err) => {
						if (err) {
							console.error(err);
							return next(err);
						}
						console.log(result);
						return resolve(result);
					});
				});
		});
	},
	truncate: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) });
	},
	delete: (channel, username) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), username: username });
	},
	insert: (channel, object) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		object.channel = stringUtils.safeChannel(channel);
		object.id = shortid.generate();
		return mongodb.insert(COLLECTION_NAME, object);
	},
	find: (channel, filter, sort, limit) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.find(COLLECTION_NAME, merge(filter, { channel: stringUtils.safeChannel(channel) }), sort, limit || -1);
	},
	get: (channel, username) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.get(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), username: username });
	}
};
