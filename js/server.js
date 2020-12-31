const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { wordFinder, wordTrieStr, reverseWordTrieStr } = require("./wordFinder");

const app = express();
app.use(helmet());

corsOptions = {
  origin: "https://nevehallon.github.io/word-game-client/",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.get("/wordFinder", (req, res, next) => {
  res.send({
    wordsFound: wordFinder(req.query.letters, Number(req.query.numBlanks)),
  });
});

app.get("/wordTrieStr", (req, res, next) => {
  res.send({
    wordTrieStr: wordTrieStr,
    reverseWordTrieStr: reverseWordTrieStr,
  });
});

const PORT = (port = process.env.PORT || 80);
app.listen(PORT, () => console.log(`Working on port ${PORT}`));
