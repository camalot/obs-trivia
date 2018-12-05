"use strict";

class ChatLoggerHandler {
	constructor(chatHandler) {
		//super();
		this._chat = chatHandler;

		this._chat.on('action', (channel, userstate, message, self) => {
			if (self) {
				return;
			}
			console.log(`[ACTION] => [${channel}] => ${userstate.username} ${message}`);
		});

		this._chat.on('chat', (channel, userstate, message, self) => {
			if (self) {
				return;
			}
			console.log(`[CHAT] => [${channel}] => ${userstate.username}: ${message}`);
		});

		this._chat.on('whisper', (channel, userstate, message) => {
			console.log(`[WHISPER] => ${userstate.username}: ${message}`);
		});

		this._chat.on("ban", (channel, username, reason) => {
			console.log(`[BAN] => [${channel}] => ${username} : ${reason}`);
		});

		this._chat.on("cheer", (channel, userstate, message) => {
			console.log(`[BITS] => [${channel}] => [${userstate.bits}] => ${userstate.username} : ${message}`);
		});

		this._chat.on('clearchat', (channel) => {
			console.log(`[CLEAR] => [${channel}]`);
		});

		this._chat.on("connecting", (address, port) => {
			console.log(`[CONNECTING] => ${address}:${port}`);
		});
		this._chat.on("connected", (address, port) => {
			console.log(`[CONNECTED] => ${address}:${port}`);
		});
		this._chat.on("disconnected", (reason) => {
			console.log(`[DISCONNECTED] => ${reason}`);
		});

		this._chat.on("emoteonly", (channel, enabled) => {
			console.log(`[EMOTEONLY] => [${channel}] => [${enabled ? "ON" : "OFF"}]`);
		});

		this._chat.on("emotesets", (sets, obj) => {

		});

		this._chat.on("followersonly", (channel, enabled, length) => {
			console.log(`[FOLLOWERSONLY] => [${channel}] => [${enabled ? "ON" : "OFF"}] : ${length} minutes`);
		});

		this._chat.on("hosted", (channel, username, viewerCount, autohost) => {
			if (autohost) {
				console.log(`[AUTOHOST] => [${channel}] => [${username}]: ${viewerCount} viewers`);
			} else {
				console.log(`[HOST] => [${channel}] => [${username}]: ${viewerCount} viewers`);
			}
		});

		this._chat.on("hosting", (channel, target, viewerCount) => {
			console.log(`[HOSTING] => [${channel}] => [${target}]: ${viewerCount} viewers`);
		});

		this._chat.on("join", (channel, username, self) => {
			if (!self) {
				console.log(`[JOIN] => [${channel}] => [${username}]`);
			}
		});
		this._chat.on("part", (channel, username, self) => {
			if (!self) {
				console.log(`[PART] => [${channel}] => [${username}]`);
			}
		});

		this._chat.on("logon", () => {
			console.log(`[LOGON] => Initializing communication`);
		});

		/*
		userstate: {
			'badges': { 'broadcaster': '1', 'warcraft': 'horde' },
			'color': '#FFFFFF',
			'display-name': 'Schmoopiie',
			'emotes': { '25': [ '0-4' ] },
			'mod': true,
			'room-id': '58355428',
			'subscriber': false,
			'turbo': true,
			'user-id': '58355428',
			'user-type': 'mod',
			'emotes-raw': '25:0-4',
			'badges-raw': 'broadcaster/1,warcraft/horde',
			'username': 'schmoopiie',
			'message-type': 'action'
		}
		*/
		this._chat.on("message", (channel, userstate, message, self) => {
			if (self) {
				return;
			}

		});

		this._chat.on("mod", (channel, username) => {
			console.log(`[MOD] => [${channel}] => [${username}]`);
		});
		this._chat.on("unmod", (channel, username) => {
			console.log(`[UNMOD] => [${channel}] => [${username}]`);
		});

		this._chat.on("mods", (channel, mods) => {
			console.log(`[MODS] => [${channel}] => ${JSON.stringify(mods)}`);
		});


		// https://docs.tmijs.org/v1.2.1/Events.html#notice
		this._chat.on("notice", (channel, msgid, message) => {
			if (msgid === "subgift") {
				console.log(`[SUBGIFT] => [${channel}] => [${message}]`);
			} else {
				console.log(`[NOTICE] => [${channel}] => [${msgid}] => ${message}`);
			}
		});

		this._chat.on("ping", () => {
			console.log("[PING]");
		});
		this._chat.on("pong", (latency) => {
			console.log(`[PONG] => ${latency}`);
		});

		this._chat.on("r9kbeta", (channel, enabled) => {
			console.log(`[R9K] => [${channel}] => [${enabled ? "ON" : "OFF"}]`);
		});

		this._chat.on("reconnect", () => {
			console.log(`[RECONNECT]`);
		});

		this._chat.on("resub", (channel, username, months, message, userstate, methods) => {
			console.log(`[RESUB] => [${channel}] => [${username}] => ${months} month(s) resub: ${message}`);
		});

		this._chat.on("roomstate", (channel, state) => {
			console.log(`[ROOMSTATE] => [${channel}] => ${JSON.stringify(state)}`);
		});

		this._chat.on("serverchange", (channel) => {
			console.log(`[SERVERCHANGE] => [${channel}]`);
		});

		this._chat.on("slowmode", (channel, enabled, length) => {
			console.log(`[SLOWMODE] => [${channel}] => [${enabled ? "ON" : "OFF"}] => ${length} delay`);
		});

		this._chat.on("subscribers", (channel, enabled) => {
			console.log(`[SUBONLY] => [${channel}] => [${enabled ? "ON" : "OFF"}]`);
		});

		this._chat.on("subscription", (channel, username, method, message, userstate) => {
			console.log(`[SUB] => [${channel}] => [${username}] => [${method}] => ${message}`);
		});

		this._chat.on("timeout", (channel, username, reason, duration) => {
			let action = 'TIMEOUT';
			if (duration <= 5) {
				action = "PURGE";
			}

			console.log(`[${action}] => [${channel}] => [${username}] => [${duration}s] => ${reason}`);
		});

		this._chat.on("unhost", (channel, viewers) => {
			console.log(`[UNHOST] => [${channel}] => ${viewers} viewers`);
		});
	}
}

module.exports = ChatLoggerHandler;
