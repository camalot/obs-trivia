"use strict";

const MongoClient = require("mongodb").MongoClient;
const config = require('../config');
const dbconfig = config.mongodb;

class MongoDatabase {
	constructor(dbname) {
		this.db = null;
		this.dbName = dbname;
		this.uri = `mongodb://${dbconfig.USERNAME}:${dbconfig.PASSWORD}@${dbconfig.HOST}:${dbconfig.PORT}/${dbname}${dbconfig.CONNECT_ARGS}`;
		console.log(this.uri);
		this.mongodb = new MongoClient(this.uri, { useNewUrlParser: true, authSource: dbconfig.AUTHDB });
	}

	connect() {
		let _this = this;
		return new Promise((resolve, reject) => {
			if (_this.db) {
				return resolve(_this.mongodb);
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

	select(collection, query, sort, options) {
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
						return resolve(null);
					}
				})
				.then(data => {
					if(data) {
						return resolve(data.sort(sort).toArray());
					} else {
						return resolve(null);
					}
				})
				.then(() => {
					return _this.close();
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});

		});
	}

	find (collection, filter, sort, limit) {
		var _this = this;
		return new Promise((resolve, reject) => {
			return _this.connect()
				.then((client) => {
					return client.db().collection(collection);
				})
				.then((col) => {
					return col.find(filter).sort(sort).limit(limit).toArray();
				})
				.then((result) => {
					if(result && result.length > 0) {
						return resolve(result);
					} else {
						return resolve(null);
					}
				})
				.then(() => {
					return _this.close();
				})
				.catch((err) => {
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
				.then(() => {
					return _this.close();
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

	updateOne(collection, filter, update, options) {
		var _this = this;
		return new Promise((resolve, reject) => {
			return _this.connect()
				.then((client) => {
					return client.db().collection(collection);
				})
				.then((col) => {
					return col.updateOne(filter, { $set: update }, options || { upsert: true, returnOriginal: true });
				})
				.then(data => {
					if(data.result.ok) {
						return _this.find(collection, filter, null, 1);
					} else {
						return resolve(null);
					}
				})
				.then((result) => {
					if(result && result.length > 0) {
						return resolve(result[0] || null);
					} else {
						return resolve(null);
					}
				})
				.then(() => {
					return _this.close();
				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});
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
						return _client.db().createCollection(collection);
					} else {
						return _client.db().collection(collection);
					}
				})
				.then((col) => {
					_collection = col;
					return _collection.findOne({ id: object.id, channel: object.channel });
				})
				.then((result) => {
					if (!result) {
						return _collection.insertOne(object);
					} else {
						return _collection.findOneAndUpdate({ id: object.id }, object);
					}
				})
				.then(() => {
					return _this.close();
				})
				.then(() => {
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
			return _this.connect()
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
					return _this.close();
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
				return _this.mongodb.close()
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
