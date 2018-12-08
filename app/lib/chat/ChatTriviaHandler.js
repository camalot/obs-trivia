"use strict";
const pointsDb = require('../database/points');
const async = require('async');
const utils = require('../utils');
const stringUtils = utils.string;

const TRIVIA_COMMAND_REGEX = /^!trivia(?:\s*(top|points|help))?/i;
const ANSWER_COMMAND_REGEX = /^!a(?:nswer)?\s\d/i;

const TOP_COMMAND_REGEX = /^!trivia\stop\s(\d)/i;

class ChatTriviaHandler {

	// 12/2/2018 @bobdadestr0yer2 donated $10: I hate you darth

	constructor(chatHandler) {
		//super();
		this._chat = chatHandler;
		console.log("chat start handler");
		this._chat.on('chat', (channel, userstate, message, self) => {
			if (self || message === "" || message === null || message === undefined) {
				return;
			}
			console.log("message: " + message);

			if (TRIVIA_COMMAND_REGEX.test(message)) {
				let match = TRIVIA_COMMAND_REGEX.exec(message);
				console.log(message);
				if(match[1]) {
					console.log(`match: ${match[1]}`);
					switch(match[1].toLowerCase()) {
						case "top":
							let tmatch = TOP_COMMAND_REGEX.exec(message);
							let count = 5;
							if (tmatch && tmatch[1]) {
								count = parseInt(tmatch[1], 0);
							}
							return this.getTopPoints(channel, count);
						case "points":
							console.log(`${channel}:${userstate.username}: get points`);
							return this.getUserPoints(channel, userstate.username);

						default:
							return this.help(channel, userstate.username);
					}
				} else {
					console.log("trivia start command");
					return this.startTrivia(channel, userstate);
				}
			}

			if (ANSWER_COMMAND_REGEX.test(message)) {
				console.log(`${channel}:${userstate.username} answered: ${message}`)
				return this.checkAnswer(channel, userstate, message);
			}

			console.log(`exit no matches: ${channel}:${userstate.username} => ${message}`);
		});
	}

	help(channel, username) {
		const _this = this;
		return new Promise((resolve, reject) => {
			return _this._chat
				.say(channel, `${username}, !trivia -> starts new trivia question. !a # -> answers current question. !trivia top # -> gets top list. !trivia points -> gets your points.`);
		});
	}

	getUserPoints(channel, username) {
		const _this = this;

		return new Promise((resolve, reject) => {
			return pointsDb.all(channel)
				.then((data) => {
					console.log("get user points");
					return async.reduce(data, 0, (prev, cur, next) => {
						if(cur.username === username) {
							return next(null, prev + cur.points);
						} else {
							return next(null, prev);
						}
					}, (err, result) => {
						if(err) {
							console.error(err);
							return reject(err);
						}

						_this._chat.say(channel, `${username} has a total of ${result} trivia points`);
						return resolve();
					});
				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});
		});
	}

	getTopPoints(channel, count) {
		const _this = this;
		count = (count > 10 ? 10 : count);
		return new Promise((resolve, reject) => {
			return pointsDb.all(channel)
				.then(data => {
					let users = [];
					let results = [];
					data.reduce((prev, cur) => {
						if (users.indexOf(cur.username) === -1) {
							users.push(cur.username);
						}
					}, users);

					async.each(users, (item, next) => {
						let userTotal = data.reduce((prev, cur) => {
							if (cur.username === item) {
								return prev + cur.points;
							} else {
								return prev;
							}
						}, 0);

						results.push({ username: item, points: userTotal });

						next();
					}, (err) => {
						if (err) {
							console.error(err);
							return next(err);
						}
						console.log(results);


						results.sort((a,b) => {
							if(a.points < b.points) return 1;
							if(a.points > b.points) return -1;
							return 0;
						});


						let topList = results.slice(0, count);

						let top = `Top ${count} Trivia User${stringUtils.plural(count)}: `;
						top += topList.map((v, idx) => `${idx + 1}) ${v.username}: ${v.points} point${stringUtils.plural(v.points)}`).join(', ');
						_this._chat.say(channel, top);
					});

				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	}

	// 12/4/2018: zehava77 cheered 100 bits
	// 12/4/2018: th3_avenger cheered 8 bits
	// 12/4/2018: zehava77 cheered 8 bits
	// 12/4/2018: zehava77 cheered 2 bits
	// 12/4/2018: zehava77 cheered 2 bits
	// 12/4/2018: zehava77 cheered 2 bits
	// 12/4/2018: sparkvolt cheered 2 bits
	checkAnswer(channel, userstate, message) {
		const _this = this;
		return new Promise((resolve, reject) => {
			const trivia = require('../trivia');
			return trivia.get(channel)
				.then((question) => {
					if (!question) {
						console.log("no question. Expect Question.");
						return resolve(false);
					}

					if (question.incorrectGuesses.indexOf(userstate.username) >= 0) {
						console.log("already guessed.");
						return resolve(null);
					}

					console.log(`enter check answer: ${message} : ${userstate.username}`);
					let answer = message.replace(/^!a(?:nswer)?\s/ig, '');
					let parsed = parseInt(answer, 0);
					let guessIndex = -1;
					if (Number.isInteger(parsed)) {
						guessIndex = parsed - 1;
					}

					if (guessIndex + 1 > question.answers.length) {
						// they guessed an index that doesnt exist.
						// 🔔 SHAME 🔔 SHAME 🔔 SHAME 🔔
						_this._chat.say(channel, `${userstate.username}, your guess is not a valid guess. 🔔 SHAME 🔔 SHAME 🔔 SHAME 🔔`);
						return resolve(null);
					}

					console.log("validate answer and update");
					return trivia.answer(channel, question.id, userstate.username, guessIndex);
				})
				.then((correct) => {
					// if we exit because they already guessed, just get out.
					if (correct == null) {
						console.log("exit: already guessed.");
						return resolve(false);
					}
					// if they are wrong, tell them.
					if (!correct) {
						return _this._chat.say(channel, `Nope, ${userstate.username}, that is incorrect.`)
							.then(() => {
								// return false
								console.log("exit and resolve after chat");
								return resolve(false);
							}).catch((err) => {
								console.error(err);
								return reject(err);
							});
					} else {
						// return if they are correct.
						console.log("exit and resolve when correct");
						return resolve(true);
					}

				})
				.catch((err) => {
					console.error(err);
					return reject(err);
				});
		});
	}

	startTrivia(channel) {
		let _this = this;
		return new Promise((resolve, reject) => {
			const trivia = require('../trivia');
			console.log("create trivia");
			trivia.get(channel)
				.then(question => {
					if (question) {
						return resolve(question);
					} else {
						return trivia.create(channel.replace(/^\#/, ''));
					}
				})
				.then((data) => {
					return resolve(data);
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	}

}


module.exports = ChatTriviaHandler;
