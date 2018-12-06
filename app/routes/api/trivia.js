'use strict';
const express = require('express');
const router = express.Router();
const trivia = require('../../lib/trivia');


router.get('/all/:channel', (req, res, next) => {
	return trivia.all(req.params.channel)
		.then(data => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});


router.get('/clear/:channel', (req, res, next) => {
	return trivia.clear(req.params.channel)
		.then(() => {
			return res.json({});
		})
		.catch((err) => {
			return next(err);
		});
});

router.get('/:channel/:id?', (req, res, next) => {
	return trivia.get(req.params.channel, req.params.id || null)
		.then((data) => {
			return res.json(data);
		})
		.catch((err) => {
			return next(err);
		});
});



module.exports = router;
