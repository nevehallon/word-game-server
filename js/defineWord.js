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

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return _.flattenDeep(objValue.concat(srcValue));
  }
  return _.flattenDeep(objValue ? [objValue, srcValue] : [srcValue]);
}

async function defineWordArr(words) {
  try {
    let list = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let result = await axios.get(`${baseUrl}/${word}${capUrl}`);
      let resultObj = {};
      if (_.isArray(result.data.results)) {
        resultObj[`${word}`] = result.data.results.reduce((acc, cur) => {
          return _.mergeWith(acc, cur, customizer);
        }, {});
        list.push(resultObj);
      }
    }
    return list;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { defineWordArr };
