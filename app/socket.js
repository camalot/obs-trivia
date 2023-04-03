"use strict";
const trivia = require('./lib/database/trivia');
const bot = require('./lib/database/bot');
const async = require('async');
const utils = require('./lib/utils');
const stats = utils.stats;

module.exports = (io) => {
	return new Promise((resolve, reject) => {
		return bot.all()
			.then((channels) => {
				async.each(channels, (item, next) => {
					console.log(`init socket for: ${item.channel}`);
					io.of(`/${item.channel}`).on("connection", (socket) => {
						return new Promise((res, rej) => {
							// socket.nsp = socket namespace
							if (!socket.nsp) {
								console.log("no socket nsp");
								return res(null);
							}

							return trivia.get(item.channel)
								.then((data) => {
									if (!data) {
										// seems to return no data when changing the state of the trivia.
										console.log("no data");
										return res(null);
									}
									if (!data.closed) {
										console.log("not closed");
										return stats.calculate(data ? data : null);
									} else {
										console.log("closed");
										return stats.winner(data);
									}
								})
								.then((data) => {
									if (data && data.closed) {
										console.log("trivia.winner");
										socket.emit('trivia.winner', data);
									} else {
										console.log("trivia.data");
										socket.emit('trivia.data', data);
									}
									console.log(data);
									if (data) {
										delete data._id;
									}
									return res(data);
								})
								.catch(err => {
									return rej(err);
								});
						});
					});
					return next();
				}, (err) => {
					if (err) {
						console.error(err);
						return reject(err);
					}
					return resolve();
				});

			});
	});
};
