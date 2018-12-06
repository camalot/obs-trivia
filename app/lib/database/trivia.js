"use strict";

const MongoDatabase = require("../MongoDatabase");
const config = require('../../config');
const dbconfig = config.mongodb;
const DATABASE_NAME = dbconfig.DATABASE;
const COLLECTION_NAME = "questions";
module.exports = {
	init: () => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	},
	all: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.select(COLLECTION_NAME, { channel: channel });
	},
	truncate: (channel) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.delete(COLLECTION_NAME, { channel: channel });
	},
	insert: (channel, object) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		object.channel = channel;
		return mongodb.insert(COLLECTION_NAME, object);
	},
	get: (channel, id) => {
		let mongodb = new MongoDatabase(DATABASE_NAME);
		return mongodb.get(COLLECTION_NAME, { channel: channel, id: id });
	}
};
