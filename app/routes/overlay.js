'use strict';
const express = require('express');
const router = express.Router();
const trivia = require('../lib/trivia');


router.get('/:channel', (req, res, next) => {
	return res.render("overlay", { channel: req.params.channel });
});


module.exports = router;
