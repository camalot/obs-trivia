'use strict';
const express = require('express');
const router = express.Router();
const bot = require('../../lib/database/bot');
const utils = require('../../lib/utils');
const stringUtils = utils.string;

router.get('/', (req, res, next) => {
	return bot.all()
		.then((data) => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.put('/:channel', (req, res, next) => {
	return bot.join(req.params.channel)
		.then(data => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.delete('/:channel', (req, res, next) => {
	return bot.part(req.params.channel)
		.then(data => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

module.exports = router;
