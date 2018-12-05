"use strict";
const fs = require('fs');
const path = require('path');
const normalizedPath = path.join(__dirname, "./");
const https = require('https');
const shortid = require('shortid');

let getAnswers = (data) => {
	let answers = data.incorrect_answers;
	let position = Math.floor(Math.random() * (answers.length + 1));

	answers.splice(position, 0, data.correct_answer);

	return {
		list: answers,
		correct: position
	};
};

let _get = (channel) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path.join(normalizedPath, `../../../data/${channel.replace(/^\#/g, '')}.json`), (err, data) => {
			if (err) {
				return reject(err);
			}
			let obj = JSON.parse(data);
			console.log(obj);
			_currentQuestion = obj;
			return resolve(obj || null);
		});
	});
};

let _writeQuestionToFile = (channel, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path.join(normalizedPath, `../../../data/${channel.replace(/^\#/g, '')}.json`), JSON.stringify(data), (err) => {
			if(err) {
				return reject(err);
			}
			return resolve(data);
		});
	});
};

let _currentQuestion = null;

// https://opentdb.com/api.php?amount=1
module.exports = {
	activeQuestion: _currentQuestion,
	create: (channel, category) => {

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
							difficulty: data.difficulty
						};
					}
					console.log("writing file");
					console.log(result);
					return _writeQuestionToFile(channel.replace(/^\#/, ''), result);
				});
			});
			request.on('error', (err) => reject(err));
		});
	},
	get: _get,
	answer: (channel, username, guessIndex) => {
		return new Promise((resolve, reject) => {
			_get(channel)
				.then((data) => {
					let result = data;

					let isCorrect = result.correctAnswer === guessIndex;
					if(isCorrect) {
						result.correctGuess = username;
					} else {
						if(result.incorrectGuesses.indexOf(username) < 0) {
							result.incorrectGuesses.push(username);
						}
					}
					// write the update to the file.
					return _writeQuestionToFile(channel, result)
						.then(() => {
							return resolve(result.correctAnswer === guessIndex);
						});
				}).catch((err) => {
					return reject(err);
				});
		});
	},
	clear: (channel) => {
		console.log("clear trivia");
		return _writeQuestionToFile(channel.replace(/^\#/, ''), null);
	}
};
