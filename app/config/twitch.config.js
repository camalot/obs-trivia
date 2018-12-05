"use strict";

module.exports = {
	twitch: {
		username: process.env.CT_TWITCH_USERNAME,
		oauth: process.env.CT_TWITCH_OAUTH,
		oauth_api: process.env.CT_TWITCH_OAUTH_API,
		client_id: process.env.CT_TWITCH_CLIENTID,
		client_secret: process.env.CT_TWITCH_CLIENTSECRET,
		channels: process.env.CT_TWITCH_CHANNELS.split(/,/g)
	}
};
