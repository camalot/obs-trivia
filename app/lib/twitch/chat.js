"use strict";
const config = require('../../config');
const botdb = require('../database/bot');
const Chat = require('tmi.js').client;

let chat = null;
function start() {
	return new Promise((resolve, reject) => {
		console.log("start");
		return botdb.channels()
		.then((chans) => {
			chans = chans || [];
			chat = new Chat({
				options: {
					debug: true
				},
				channels: chans.map((x) => `#${x}`),
				identity: {
					username: config.twitch.username,
					password: config.twitch.oauth
				},
				connection: {
					reconnect: true
				}
			});
			console.log('Connecting to chat...');
			return chat.connect();
		})
		.then(() => {
			console.log('chat Connected.');
			return resolve(chat);
		})
		.catch(err => {
			console.error(err);
			return reject(err);
		});
	});
}

let register = () => {
	return new Promise((resolve, reject) => {
		if (!chat) {
			return reject('chat object not initialized.');
		}
		console.log("init handlers");
		require('../chat')(chat);

		resolve();
	});
};


module.exports = {
	initialize: start,
	register: register
};
