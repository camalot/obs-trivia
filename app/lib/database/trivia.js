"use strict";

const MongoDatabase = require("../MongoDatabase");
const config = require('../../config');
const dbconfig = config.mongodb;
const DATABASE_NAME = dbconfig.DATABASE;
const COLLECTION_NAME = "questions";
const merge = require('merge');
const utils = require('../utils');
const stringUtils = utils.string;
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
	truncate: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel) });
	},
	delete: (channel, id) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: id });
	},
	insert: (channel, object) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		object.channel = stringUtils.safeChannel(channel);
		return mongodb.insert(COLLECTION_NAME, object);
	},
	update: (channel, object) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		let update = merge(object, {});

		delete update._id;
		return mongodb.updateOne(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: object.id }, update);
	},
	find: (channel, filter, sort, limit) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.find(COLLECTION_NAME, merge(filter, { channel: stringUtils.safeChannel(channel) }), sort, limit || -1);
	},
	get: (channel, id) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.get(COLLECTION_NAME, { channel: stringUtils.safeChannel(channel), id: id });
	}
};
