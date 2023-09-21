import { Router } from "express";
import { wordFinder, wordTrieStr, reverseWordTrieStr } from '../utils/wordFinder';
import { defineWordArr } from '../utils/defineWord';

const router = Router();

router.get(
	'/',
	async (_, res) => {
		res.send(
			'Hello World!');
	}
);

router.get(
	'/wordFinder',
	(req, res,) => {
		res.send(
			{
				wordsFound: wordFinder(
					(req?.query?.letters as string) || '',
					Number(req.query.numBlanks)
				),
			});
	}
);

router.get(
	'/wordTrieStr',
	(_, res) => {
		res.send(
			{
				wordTrieStr,
				reverseWordTrieStr,
			});
	}
);

router.get(
	'/defineWords',
	async (req, res) => {
		let words = (req.query.words as string).replace(/ */g, '').split(',');
		res.send(
			{
				words: await defineWordArr(words),
			});
	}
);

router.all('*',
	(_, res) => {
		res.send(
			'404: page not found');
	}
);

export default router;