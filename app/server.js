"use strict";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require("morgan");
const favicon = require("serve-favicon");
const config = require('./config');
const app = express();
const triviadb = require('./lib/database/trivia');

const passport = require("passport");
const TwitchStrategy = require("passport-twitch").Strategy;
const UserAuthHandler = require('./lib/auth/UserAuthHandler');
const server = require('http').Server(app);
const socket = require('socket.io')(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
require("./lib/hbs/xif");
require("./lib/hbs/sections");
require("./lib/hbs/partials");

app.use(favicon(path.join(__dirname, "assets/images", "bit13-16.png")));

// 12/11/2018 @dewberry512 1050 bits
// 12/11/2018 @zehava77 2

app.use(
	session({
		secret: "aikfef93ja032~39@ajdsrdrbftrt4ghtrkql23",
		resave: true,
		saveUninitialized: true
	})
);


app.use(passport.initialize());
app.use(passport.session()); // passport session middleware

passport.use(
	new TwitchStrategy(
		{
			clientID: config.twitch.client_id,
			clientSecret: config.twitch.client_secret,
			callbackURL: `http://${config.isProduction ? config.site.hostName : "localhost:3000"}/auth/twitch/callback`,
			scope: "user_read"
		},
		(accessToken, refreshToken, profile, done) => {
			return new UserAuthHandler(accessToken, refreshToken, profile, done);
		}
	)
);

passport.serializeUser((user, done) => {
	return done(null, user);
});

passport.deserializeUser((user, done) => {
	return done(null, user);
});


app.use(require('./lib/middleware/socketio')(socket));
app.use(require('./lib/middleware/user'));

require('./socket')(socket);

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/assets", express.static(path.join(__dirname, "assets")));

require("./routes")(app);

let chat = require('./lib/twitch/chat');
chat.initialize()
	.then((c) => {
		if (c) {
			console.log("register");
			return chat.register(socket);
		} else {
			return new Promise((resolve, reject) => {
				return resolve();
			});
		}
	})
	.then(() => {
		return triviadb.init();
	})
	.catch(err => {
		console.error(err);
		return;
	});
// 404 error handler
app.use(
	require('./lib/express/handlers/FileNotFoundHandler')("Page Not Found", 404)
);

// 500 error handler
app.use(
	require('./lib/express/handlers/ErrorHandler')()
);

module.exports = { app: app, server: server, io: socket };
