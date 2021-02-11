require("dotenv").config();
const _ = require("lodash");
const cheerio = require("cheerio");

const fetch = require("node-fetch");

let baseUrl = "http://api.wordnik.com/v4/word.json";

baseUrl = process.env.baseUrl;

let dictionary = process.env.dictionary;

async function fallBackReq(word) {
  try {
    let options = JSON.parse(process.env.reqOptions);

    let checkRes = await fetch(process.env.backUpBaseUrl, { ...options });

    options.headers.cookie = checkRes.headers.get("set-cookie");
    // console.log(options);

    let res = await fetch(process.env.backUpBaseUrl + "tools#dictionary", {
      ...options,
      body: `dictWord=${word}`,
      method: "POST",
    });
    res = await res.text();
    let $ = cheerio.load(res, { decodeEntities: false });
    let def = $(".word-definition").children().remove().end().text();
    // console.log(def);
    if (
      def.includes("defined at merriam-webster.com") ||
      def.includes("Check out the spelling of your word and try again.")
    ) {
      return { success: false, definitions: [{ text: "" }], headWord: word };
    }

    return { success: true, definitions: [{ txt: def.trim(), part: null, upvotes: 1000 }], headWord: word };
  } catch (error) {
    console.log("error 2", error, word);
    return { success: false, definitions: [{ text: "" }], headWord: word };
  }
}

async function getDef(word) {
  try {
    let res = await fetch(`${dictionary}/${word}`);
    res = await res.text();

    let $ = cheerio.load(res, { decodeEntities: false });

    let script = $(`body script`).eq(0).html();

    let hasDef = script.includes("window.__NUXT__=");
    if (!hasDef) return await fallBackReq(word);

    script = script.replace("window.__NUXT__=", "");

    let info = new Function("return " + script);

    if (!info().state.Filter.definitions.length) return await fallBackReq(word);

    return info().state.Filter;
  } catch (error) {
    console.log("error 1", error, word);

    return await fallBackReq(word);
  }
}

async function defineWordArr(words) {
  let currentWord;
  try {
    let list = [];
    for (const word of words) {
      currentWord = word;
      let res = await getDef(word);

      if (res?.success === false || res?.success === true) {
        let { headword, definitions, pronunciation, origin, success } = res;
        res = { headword, definitions, pronunciation, origin, success };

        list.push(res);
      } else {
        let fallBackDef = await fallBackReq(word);
        res?.definitions?.push(fallBackDef.definitions[0]);
        res.headWord = word;
        let { headword, definitions, pronunciation, origin, success } = res;
        res = { headword, definitions, pronunciation, origin, success };

        list.push(res);
      }
    }

    return list;
  } catch (error) {
    console.log("error 3", error, currentWord);
  }
}

module.exports = { defineWordArr };
