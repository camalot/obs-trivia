'use strict';
const express = require('express');
const router = express.Router();
const bot = require('../../lib/database/bot');
const utils = require('../../lib/utils');
const stringUtils = utils.string;

router.get('/', (req, res, next) => {
	return bot.channels()
		.then((data) => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.get('/all', (req, res, next) => {
	return bot.all()
		.then((data) => {
			return res.json(data);
		})
		.catch(err => {
			return next(err);
		});
});

router.post("/:channel", (req, res, next) => {

	let obj = req.body;
	if(!obj.id && !obj.enabled) {
		return next(new Error('Invalid Update Object Specified'));
	} else {
		return bot.update(req.params.channel, obj)
			.then((d) => {
				return res.json(d);
			})
			.catch(err => {
				return next(err);
			});
	}
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
