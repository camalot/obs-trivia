"use strict";

const MongoClient = require("mongodb").MongoClient;
const config = require('../config');
const dbconfig = config.mongodb;

class MongoDatabase {
	constructor(dbname) {
		this.db = null;
		this.dbName = dbname;
		this.uri = `mongodb://${dbconfig.ROOT_USERNAME}:${dbconfig.ROOT_PASSWORD}@${dbconfig.HOST}:${dbconfig.PORT}/${dbname}`;
		this.mongodb = new MongoClient(this.uri, { useNewUrlParser: true, authSource: "admin" });
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
						_this.db = database.db();
						return resolve(database);
					})
					.catch(err => {
						console.error(err);
						return reject(err);
					});
			}
		});
	}

	select(collection, query, options) {
		var _this = this;
		return new Promise((resolve, reject) => {
			return _this.connect()
				.then(client => {
					return client.db().collection(collection);
				})
				.then((col) => {
					if (col) {
						return col.find(query, options);
					} else {
						console.log("no collection");
						return resolve(null);
					}
				})
				.then(data => {
					if(data) {
						return resolve(data.toArray());
					} else {
						console.log("no data");
						return resolve(null);
					}
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});

		});
	}

	delete(collection, filter, options) {
		var _this = this;
		return new Promise((resolve, reject) => {
			return _this.connect()
				.then((client) => {
					return client.db().collection(collection);
				})
				.then((col) => {
					return col.deleteMany(filter, options);
				})
				.then(() => {
					return resolve();
				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});
		});
	}

	truncate(collection) {
		return this.delete(collection);
	}

	update(collection, filter) {
		return new Promise((resolve, reject) => {
			return reject('Not implemented');
		});
	}

	insert(collection, object) {
		let _this = this;

		return new Promise((resolve, reject) => {
			let _client = null;
			let _collection = null;
			return _this.connect()
				.then(client => {
					_client = client;
					return client.db().listCollections({ name: collection }).toArray();
				})
				.then((colinfo) => {
					console.log(colinfo);
					if (!colinfo || colinfo.length === 0) {
						console.log("create collection");
						return _client.db().createCollection(collection);
					} else {
						return _client.db().collection(collection);
					}
				})
				.then((col) => {
					_collection = col;
					console.log(`find: ${object.id}:${object.channel}`);
					return _collection.findOne({ id: object.id, channel: object.channel });
				})
				.then((result) => {
					if (!result) {
						console.log("insert new");
						return _collection.insertOne(object);
					} else {
						console.log("find and update");
						return _collection.findOneAndUpdate({ id: object.id }, object);
					}
				})
				.then(() => {
					console.log("close db");
					return _this.mongodb.close();
				})
				.then(() => {
					console.log("return object");
					return resolve(object);
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	}


	get(collection, query) {
		let _this = this;
		return new Promise((resolve, reject) => {
			return _this.mongodb.connect()
				.then(client => {
					return client
						.db()
						.collection(collection)
						.findOne(query);
				})
				.then(result => {
					return resolve(result);
				})
				.then(() => {
					return _this.mongodb.close();
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
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
