"use strict";
const https = require('https');
const shortid = require('shortid');
const triviaDb = require('../database/trivia');

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
						created: Date.UTC(),
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
			console.log("new question");
			return _new(channel)
			.then(r => resolve(r))
			.catch(err => reject(err));
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

let _currentQuestion = null;

// https://opentdb.com/api.php?amount=1
module.exports = {
	activeQuestion: _currentQuestion,
	create: _new,
	get: _get,
	all: (channel) => triviaDb.all(channel),
	answer: (channel, username, guessIndex) => {
		return new Promise((resolve, reject) => {
			_get(channel)
				.then((data) => {
					let result = data;

					let isCorrect = result.correctAnswer === guessIndex;
					result.ended = Date.UTC();
					if (isCorrect) {
						result.correctGuess = username;
					} else {
						if (result.incorrectGuesses.indexOf(username) < 0) {
							result.incorrectGuesses.push(username);
						}
					}


					return resolve(false);
					// write the update to the file.
					// return _writeQuestionToFile(channel, result)
					// 	.then(() => {
					// 		return resolve(result.correctAnswer === guessIndex);
					// 	});
				}).catch((err) => {
					return reject(err);
				});
		});
	},
	truncate: (channel) => triviaDb.truncate(channel || "_DUMMY_"),
	clear: (channel) => {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	}
};
