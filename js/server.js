require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { wordFinder, wordTrieStr, reverseWordTrieStr } = require("./wordFinder");
const { defineWordArr } = require("./defineWord");

const app = express();
app.use(helmet());

corsOptions = {
  origin: process.env.BASE_URL || "https://nevehallon.github.io",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// app.use(cors(corsOptions));
app.use(cors());

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

app.get("/defineWords", async (req, res) => {
  let words = req.query.words.split(",");
  res.send({
    words: await defineWordArr(words),
  });
});

app.all("*", (req, res) => {
  res.send("404: page not found");
});
const PORT = (port = process.env.PORT || 80);
app.listen(PORT, () => console.log(`Working on port ${PORT}`));
