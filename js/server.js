require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { wordFinder, wordTrieStr, reverseWordTrieStr } = require('./wordFinder');
const { defineWordArr } = require('./defineWord');

const app = express();
const compression = require('compression');
app.use(helmet());
app.use(compression({ level: 6, filter: shouldCompress }));

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

corsOptions = {
  origin: process.env.BASE_URL || 'https://nevehallon.github.io',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get('/wordFinder', (req, res, next) => {
  res.send({
    wordsFound: wordFinder(req.query.letters, Number(req.query.numBlanks)),
  });
});

app.get('/wordTrieStr', (req, res, next) => {
  res.send({
    wordTrieStr: wordTrieStr,
    reverseWordTrieStr: reverseWordTrieStr,
  });
});

app.get('/defineWords', async (req, res) => {
  let words = req.query.words.replace(/ */g, '').split(',');
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
const PORT = (port = process.env.PORT || 80);
app.listen(PORT, () => console.log(`Working on port ${PORT}`));
