require("dotenv").config();
const _ = require("lodash");
const cheerio = require("cheerio");

const axios = require("axios");

let baseUrl = "http://api.wordnik.com/v4/word.json";

baseUrl = process.env.baseUrl;

let dictionary = process.env.dictionary;

async function getDef(word) {
  try {
    let res = await axios.get(`${dictionary}/${word}`);
    let $ = cheerio.load(res.data, { decodeEntities: false });

    let script = $(`body script`).eq(0).html();

    script = script.replace("window.__NUXT__=", "");

    let info = new Function("return " + script);

    return info().state.Filter;
  } catch (error) {
    console.log("error 1");

    return { definitions: [], headword: word };
  }
}

async function defineWordArr(words) {
  try {
    let list = [];
    for (const word of words) {
      let res = await getDef(word);

      list.push(res);
    }
    return list;
  } catch (error) {
    console.log("error 2", error);
  }
}

module.exports = { defineWordArr };
