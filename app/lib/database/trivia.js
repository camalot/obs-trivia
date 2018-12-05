"use strict";

const MongoDatabase = require("../MongoDatabase");
const DATABASE_NAME = "trivia";

module.exports = {
	init: () => {
		return new Promise((resolve, reject) => {
			let mongodb = new MongoDatabase(DATABASE_NAME);
			return mongodb.connect()
				.then(client => {
					return resolve({
						id: 'DUMMY',
						channel: "DUMMY",
						question: "DUMMY",
						category: "DUMMY",
						answers: ["DUMMY"],
						correctAnswer: 0,
						correctGuess: null,
						incorrectGuesses: [],
						difficulty: "DUMMY"});
				})
				.then(() => {
					return mongodb.close();
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	},
	get: id => {
		return new Promise((resolve, reject) => {
			let mongodb = new MongoDatabase(DATABASE_NAME);
			return mongodb.connect()
				.then(client => {
					return client
						.db()
						.collection("questions")
						.findOne({ id: id });
				})
				.then(user => {
					return resolve(user);
				})
				.then(() => {
					return mongodb.close();
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	}
};
