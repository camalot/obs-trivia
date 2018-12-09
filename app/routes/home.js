'use strict';
const express = require('express');
const router = express.Router();
const trivia = require('../lib/trivia');


router.get('/', (req, res, next) => {
	return res.render("home");
});


module.exports = router;
