'use strict';
const express = require('express');
const router = express.Router();
const trivia = require('../lib/trivia');


router.get('/:channel', (req, res, next) => {

	return trivia.get(req.params.channel)
		.then((t) => {
			return res.render("overlay", { trivia: t, channel: req.params.channel });

		});

});


module.exports = router;
