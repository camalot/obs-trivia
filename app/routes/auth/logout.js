"use strict";
const express = require("express");
const router = express.Router();
const auth = require("../../lib/utils").auth;
const config = require('./logout.config');


router.get("/", (req, res, next) => {
	req.logout();
	res.redirect("/");
});

router.post("/", (req, res, next) => {
	throw 404;
});

module.exports = router;
