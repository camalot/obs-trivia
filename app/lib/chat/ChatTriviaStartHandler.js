"use strict";

const TRIVIA_COMMAND_REGEX = /^!trivia\s*$/ig;
const ANSWER_COMMAND_REGEX = /^!a(?:nswer)?\s[1-4]$/ig;

class ChatTriviaStartHandler {

	// 12/2/2018 @bobdadestr0yer2 donated $10: I hate you darth

	constructor(chatHandler) {
		//super();
		this._currentQuestion = null;
		this._chat = chatHandler;
		console.log("chat start handler");
		this._chat.on('chat', (channel, userstate, message, self) => {
			if (self || !message) {
				return;
			}
			console.log("message: " + message);

			if (TRIVIA_COMMAND_REGEX.test(message)) {
				return this.startTrivia(channel, userstate);
			} else if (ANSWER_COMMAND_REGEX.test(message)) {
				return this.checkAnswer(channel, userstate, message);
			}
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
		return new Promise((resolve, reject) => {
			const trivia = require('../trivia');
			return trivia.get(channel)
				.then((question) => {
					this._currentQuestion = question;
					if (this._currentQuestion === null ||
						// user has already guessed
						this._currentQuestion.incorrectGuesses.indexOf(userstate.username) >= 0) {
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
					return trivia.answer(channel, userstate.username, guessIndex);
				})
				.then((correct) => {
					// if we exit because they already guessed, just get out.
					if(correct == null) {
						return resolve(false);
					}
					// if they are wrong, tell them.
					if (!correct) {
						this._chat.say(channel, `Nope, ${userstate.username}, that is incorrect.`);
					}
					// return if they are correct.
					return resolve(correct);
				})
				.catch((err) => {
					return reject(err);
				});
		});
	}

	startTrivia(channel) {
		return new Promise((resolve, reject) => {
			if (this._currentQuestion !== null) {
				return resolve(this._currentQuestion);
			}
			const trivia = require('../trivia');
			console.log("create trivia");
			return trivia.create(channel.replace(/^\#/, ''))
				.then((data) => {
					console.log(this._currentQuestion);
					this._currentQuestion = data;
					console.log(this._currentQuestion);
					return resolve(this._currentQuestion);
				})
				.catch(err => {
					console.error(err);
					return reject(err);
				});
		});
	}

}


module.exports = ChatTriviaStartHandler;
