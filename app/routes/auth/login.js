"use strict";
const express = require("express");
const router = express.Router();
const config = require('./login.config');
const auth = require("../../lib/utils").auth;

router.get("/", (req, res, next) => { return res.redirect('/auth/twitch') ;}, (req, res, next) => {
	return next();
});

module.exports = router;
