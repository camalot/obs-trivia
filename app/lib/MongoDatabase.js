"use strict";

const MongoClient = require("mongodb").MongoClient;
const config = require('../config');
const dbconfig = config.mongodb;

class MongoDatabase {
	constructor(dbname) {
		this.db = null;
		this.dbName = dbname;
		this.uri = `mongodb://${dbconfig.USERNAME}:${dbconfig.PASSWORD}@${dbconfig.HOST}:${dbconfig.PORT}/${dbname}`;
		this.mongodb = new MongoClient(this.uri, { useNewUrlParser: true });
	}

	connect() {
		let _this = this;
		return new Promise((resolve, reject) => {
			if (_this.db) {
				return resolve(_this.db);
			} else {
				return _this.mongodb
					.connect()
					.then(database => {
						_this.db = database;
						return resolve(database);
					})
					.catch(err => {
						console.error(err);
						return reject(err);
					});
			}
		});
	}

	close() {
		let _this = this;
		return new Promise((resolve, reject) => {
			if (_this.db) {
				return _this.db
					.close()
					.then(() => {
						return resolve();
					})
					.catch(err => {
						return reject(err);
					});
			}
		});
	}
}


module.exports = MongoDatabase;
