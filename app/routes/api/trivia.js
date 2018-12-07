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


router.get('/clear/:channel/:id', (req, res, next) => {
	return trivia.clear(req.params.channel, req.params.id)
		.then((data) => {
			return res.json({});
		})
		.catch((err) => {
			return next(err);
		});
});

router.get('/latest/:channel', (req, res, next) => {
	return trivia.latest(req.params.channel)
		.then(data => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.get('/:channel/:id?', (req, res, next) => {
	return trivia.get(req.params.channel, req.params.id || null)
		.then((data) => {
			console.log("data:");
			console.log(data);
			return res.json(data);
		})
		.catch((err) => {
			return next(err);
		});
});

router.delete('/:channel/:id?', (req, res, next) => {
	return trivia.delete(req.params.channel, req.params.id)
		.then(() => {
			return res.json({});
		})
		.catch((err) => {
			return next(err);
		});
});

router.post('/:channel', (req, res, next) => {
	return trivia.create(req.params.channel)
		.then((data) => {
			return res.json(data);
		})
		.catch((err) => {
			return next(err);
		});
});



module.exports = router;
