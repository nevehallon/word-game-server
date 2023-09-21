require('dotenv').config();
import express from 'express';
import helmet from 'helmet';
import { wordFinder, wordTrieStr, reverseWordTrieStr } from './wordFinder';
import { defineWordArr } from './defineWord';
import { useCompression } from './middlewares/compression';
import { useCors } from './middlewares/cors';

const app = express();
app.use(helmet());
app.use(useCompression());
app.use(useCors());



app.get('/wordFinder', (
	req,
	res,
) => {
	res.send({
		wordsFound: wordFinder(
			(req?.query?.letters as string) || '',
			Number(req.query.numBlanks)
		),
	});
});

app.get('/wordTrieStr', (req, res, next) => {
	res.send({
		wordTrieStr,
		reverseWordTrieStr,
	});
});

app.get('/defineWords', async (req, res) => {
	let words = (req.query.words as string).replace(/ */g, '').split(',');
	res.send({
		words: await defineWordArr(words),
	});
});

app.get('/', async (req, res) => {
	res.send('Hello World!');
});

app.all('*', (req, res) => {
	res.send('404: page not found');
});
const PORT = process.env.PORT || 80
app.listen(PORT, () => console.log(`Working on port ${PORT}`));
