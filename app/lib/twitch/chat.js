"use strict";
const config = require('../../config');

let chat = null;
function start() {
	// const { Chat } = require('twitch-toolkit');
	const Chat = require('tmi.js').client;

	return new Promise((resolve, reject) => {
		let channels = config.twitch.channels || [];
				console.log(channels.map(x => x));
				chat = new Chat({
					options: {
						debug: true
					},
					channels: channels.map((x) => `#${x}`),
					identity: {
						username: config.twitch.username,
						password: config.twitch.oauth
					},
					connection: {
						reconnect: true
					}
				});
				console.log('Connecting to chat...');
			return chat.connect()
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
