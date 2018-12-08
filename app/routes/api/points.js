'use strict';
const express = require('express');
const router = express.Router();
const points = require('../../lib/database/points');
const utils = require('../../lib/utils');
const stringUtils = utils.string;

router.get('/all/total/:channel', (req, res, next) => {
	return points.totals(req.params.channel)
		.then(data => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.get('/all/:channel', (req, res, next) => {
	return points.all(req.params.channel)
		.then(data => {
			console.log(data);
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.get('/count/:channel/:username', (req, res, next) => {
	return points.count(req.params.channel, req.params.username)
		.then(data => {
			console.log(data);
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});
module.exports = router;
