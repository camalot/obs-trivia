"use strict";
const https = require('https');
const shortid = require('shortid');
const triviaDb = require('../database/trivia');
const dateUtil = require('../utils').date;

let getAnswers = (data) => {
	let answers = data.incorrect_answers;
	let position = Math.floor(Math.random() * (answers.length + 1));

	answers.splice(position, 0, data.correct_answer);

	return {
		list: answers,
		correct: position
	};
};

let _new = (channel) => {
	return new Promise((resolve, reject) => {
		const request = https.get(`https://opentdb.com/api.php?amount=1`, (response) => {
			if (response.statusCode < 200 || response.statusCode > 299) {
				reject(new Error('Failed to load page, status code: ' + response.statusCode));
			}

			const body = [];
			response.on('data', (chunk) => body.push(chunk));
			response.on('end', () => {
				let data = JSON.parse(body.join(''));
				data = data.results[0] || null;
				let result = null;

				if (data) {
					let answers = getAnswers(data);
					result = {
						id: shortid.generate(),
						channel: channel,
						question: data.question,
						category: data.category,
						answers: answers.list,
						correctAnswer: answers.correct,
						correctGuess: null,
						incorrectGuesses: [],
						difficulty: data.difficulty,
						created: dateUtil.utc(),
						ended: null
					};
					console.log("begin insert");
					return triviaDb.insert(channel, result)
						.then((r) => {
							console.log("after insert of new question");
							console.log(r);
							return resolve(r);
						});
				} else {
					console.log("return null");
					return resolve(null);
				}
			});
		});
		request.on('error', (err) => reject(err));
	});
};

let _get = (channel, id) => {
	return new Promise((resolve, reject) => {
		if (!id) {
			console.log("get latest");
			return _getLatest(channel)
				.then(r => {
					return resolve(r);
				})
				.catch(err => {
					return reject(err);
				});
		} else {
			console.log(`get: ${id}:${channel}`);
			return triviaDb.get(channel, id)
				.then((result) => {
					console.log("return object");
					return resolve(result);
				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});
		}
	});
};

let _getLatest = (channel) => {
	return new Promise((resolve, reject) => {
		return triviaDb.find(channel, { ended: null }, { created: -1 }, 1)
			.then((data) => {
				if(!data && data.length > 0) {
					return resolve(null);
				} else {
					return resolve(data[0]);
				}
			})
			.catch((err) => {
				return reject(err);
			});
	});
};

let _currentQuestion = null;

// https://opentdb.com/api.php?amount=1
module.exports = {
	activeQuestion: _currentQuestion,
	create: _new,
	get: _get,
	latest: _getLatest,
	all: (channel) => triviaDb.all(channel),
	answer: (channel, id, username, guessIndex) => {
		return new Promise((resolve, reject) => {
			return _get(channel, id)
				.then((data) => {
					let result = data;
					result.channel = channel;
					let isCorrect = result.correctAnswer === guessIndex;
					result.ended = dateUtil.utc();
					if (isCorrect) {
						result.correctGuess = username;
					} else {
						if (result.incorrectGuesses.indexOf(username) < 0) {
							result.incorrectGuesses.push(username);
						}
					}
					return triviaDb.update(channel, result);
				})
				.then((result) => {
					if (result) {
						let isCorrect = result.correctAnswer === guessIndex;
						return resolve(isCorrect);
					} else {
						return resolve(false);
					}
				}).catch((err) => {
					return reject(err);
				});
		});
	},
	delete: (channel, id) => triviaDb.delete(channel, id),
	truncate: (channel) => triviaDb.truncate(channel || "_DUMMY_"),
	clear: (channel, id) => {
		return new Promise((resolve, reject) => {
			return _get(channel, id)
				.then((data) => {
					let result = data;
					result.channel = channel;
					result.ended = dateUtil.utc();
					return triviaDb.update(channel, result);
				})
				.then((data) => {
					console.log("after update");
					console.log(data);
					return resolve(data);
				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});
		});
	}
};
