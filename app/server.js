"use strict";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require('cookie-parser')
const logger = require("morgan");
const favicon = require("serve-favicon");
const config = require('./config');
const app = express();
const triviaDb = require('./lib/database/trivia');

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
require("./lib/hbs/xif");
require("./lib/hbs/sections");
app.use(favicon(path.join(__dirname, "assets/images", "bit13-16.png")));

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/assets", express.static(path.join(__dirname, "assets")));

require("./routes")(app);

let chat = require('./lib/twitch/chat');
chat.initialize()
	.then((c) => {
		return chat.register();
	})
	.then(() => {
		return triviaDb.init();
	})
	.catch(err => {
		console.error(err);
		throw err;
	});
// 404 error handler
app.use(
	require('./lib/express/handlers/FileNotFoundHandler')("Page Not Found", 404)
);

// 500 error handler
app.use(
	require('./lib/express/handlers/ErrorHandler')()
);


module.exports = app;
