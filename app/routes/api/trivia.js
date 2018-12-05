'use strict';
const express = require('express');
const router = express.Router();
const trivia = require('../../lib/trivia');

router.get('/:channel', (req, res, next) => {
	trivia.get(req.params.channel)
		.then((data) => {
			return res.json(data);
		})
		.catch((err) => {
			return next(err);
		});
});

router.get('/clear/:channel', (req, res, next) => {
	trivia.clear(req.params.channel)
		.then(() => {
			return res.json({});
		})
		.catch((err) => {
			return next(err);
		});
});

module.exports = router;
