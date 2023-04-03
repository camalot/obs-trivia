'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/twitch', passport.authenticate('twitch'), (req, res, next) => {
	return next();
});

router.get('/twitch/callback',
	passport.authenticate('twitch', { failureRedirect: '/' }),
	(req, res, next) => {
		return res.redirect('/manage');
	}
);

module.exports = router;
