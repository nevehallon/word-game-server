require("dotenv").config();
const _ = require("lodash");
const cheerio = require("cheerio");

const axios = require("axios");

let baseUrl = "http://api.wordnik.com/v4/word.json";

baseUrl = process.env.baseUrl;
let capUrl = process.env.capUrl;
let dictionary = process.env.dictionary;

axios
  .get(`${dictionary}/hello`)
  .then((res) => {
    let $ = cheerio.load(res.data, { decodeEntities: false });

    let script = $(`body script`).eq(0).html().replace("window.__NUXT__=", "");

    let fn = new Function("return " + script);

    console.log(fn());
  })
  .catch(console.log);

async function defineWordArr(words) {
  try {
    let list = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let res = await axios.get(`${dictionary}/${word}`);
      let $ = cheerio.load(res.data, { decodeEntities: false });

      let script = $(`body script`).eq(0).html().replace("window.__NUXT__=", "");

      let info = new Function("return " + script);

      list.push(info().state.Filter);
    }
    return list;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { defineWordArr };
