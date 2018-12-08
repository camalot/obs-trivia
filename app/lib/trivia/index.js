"use strict";
const https = require('https');
const shortid = require('shortid');
const triviaDb = require('../database/trivia');
const utils = require('../utils');
const dateUtil = utils.date;
const stringUtil = utils.string;
const pointsDb = require('../database/points');

let DIFFICULTY = {
	"none": 0,
	"easy": 100,
	"medium": 300,
	"hard": 500
};

let getAnswers = (data) => {
	let answers = data.incorrect_answers;
	let position = Math.floor(Math.random() * (answers.length + 1));

	answers.splice(position, 0, data.correct_answer);

	return {
		list: answers,
		correct: position
	};
};

let _validateAnswer = (channel, id, username, guessIndex) => {
	channel = stringUtil.safeChannel(channel);
	return new Promise((resolve, reject) => {
		return _get(channel, id)
			.then((data) => {
				let result = data;
				result.channel = channel;
				let isCorrect = result.correctAnswer === guessIndex;
				if (isCorrect) {
					// only set `ended` if correct
					result.ended = dateUtil.utc();
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
					if (isCorrect) {
						return pointsDb.insert(channel, {
							username: username,
							channel: stringUtil.safeChannel(channel),
							points: DIFFICULTY[result.difficulty || "none"],
							created: dateUtil.utc(),
							question: result.id
						}).then(() => {
							return resolve(true);
						})
							.catch(err => {
								console.error(err);
								return reject(err);
							});
					} else {
						// incorrect, just resolve
						return resolve(false);
					}
				} else {
					// no result, just resolve
					return resolve(false);
				}
			}).catch((err) => {
				console.error(err);
				return reject(err);
			});
	});
};

let _new = (channel) => {
	channel = stringUtil.safeChannel(channel);
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
					return triviaDb.insert(channel, result)
						.then((r) => {
							return resolve(r);
						});
				} else {
					return resolve(null);
				}
			});
		});
		request.on('error', (err) => reject(err));
	});
};

let _get = (channel, id) => {
	channel = stringUtil.safeChannel(channel);
	return new Promise((resolve, reject) => {
		if (!id) {
			console.log(`no id, get latest: channel: ${channel}`);
			return _getLatest(channel)
				.then(r => {
					console.log("return latest item");
					console.log(r);
					return resolve(r);
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		} else {
			console.log(`get: ${id}:${channel}`);
			return triviaDb.get(channel, id)
				.then((result) => {
					console.log("return item by id");
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
	channel = stringUtil.safeChannel(channel);
	return new Promise((resolve, reject) => {
		return triviaDb.find(channel, { ended: null }, { created: -1 }, 1)
			.then((data) => {
				if (!data || data.length === 0) {
					console.log("latest: no result");
					return resolve(null);
				} else {
					console.log("latest: return item");
					return resolve(data[0]);
				}
			})
			.catch((err) => {
				console.error(err);
				return reject(err);
			});
	});
};

let _clear = (channel, id) => {
	channel = stringUtil.safeChannel(channel);
	return new Promise((resolve, reject) => {
		return _get(channel, id)
			.then((data) => {
				let result = data;
				result.channel = channel;
				result.ended = dateUtil.utc();
				return triviaDb.update(channel, result);
			})
			.then((data) => {
				return resolve(data);
			})
			.catch((err) => {
				console.error(err);
				return reject(err);
			});
	});
};

// https://opentdb.com/api.php?amount=1
module.exports = {
	create: _new,
	get: _get,
	latest: _getLatest,
	all: (channel) => triviaDb.all(stringUtil.safeChannel(channel)),
	answer: _validateAnswer,
	delete: (channel, id) => triviaDb.delete(stringUtil.safeChannel(channel), id),
	truncate: (channel) => triviaDb.truncate(stringUtil.safeChannel(channel || "_DUMMY_")),
	clear: _clear
};
