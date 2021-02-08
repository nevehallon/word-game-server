require("dotenv").config();
const _ = require("lodash");
const cheerio = require("cheerio");

const fetch = require("node-fetch");

let baseUrl = "http://api.wordnik.com/v4/word.json";

baseUrl = process.env.baseUrl;

let dictionary = process.env.dictionary;

async function fallBackReq(word) {
  try {
    let d = new Date();
    d.setTime(d.getTime() + 364 * 24 * 60 * 60 * 1e3);
    d = d.toUTCString();

    let options = JSON.parse(process.env.reqOptions);
    options.headers.cookie = `visid_incap_1950811=5tpV2N91QE+u/j6WqvNsc9OfIGAAAAAAQUIPAAAAAAAyNFypVvHDOqb1P8fohqF2; expires=${d}; HttpOnly; path=/; Domain=.hasbro.com; incap_ses_254_1950811=Y1J6O589Wzdpyb9a7WOGA9OfIGAAAAAAWe2wfZ2CtdCheN7Hzy+5Pg==; path=/; Domain=.hasbro.com`;
    // `incap_ses_254_1950811=a; Max-Age=0; path=/; expires=${d}; Domain=.hasbro.com`;
    //expires=Mon, 07 Feb 2022 10:15:55 GMT

    // let checkRes = await fetch(process.env.backUpBaseUrl, {
    //   // ...JSON.parse(process.env.reqOptions),
    //   ...options,
    //   referrer: "https://scrabble.hasbro.com/en-us/",
    //   method: "GET",
    // });

    //  console.log(checkRes);

    // let options = JSON.parse(process.env.reqOptions);
    // options.headers.cookie = `incap_ses_254_1950811=a; Max-Age=0; path=/; expires=${d}; Domain=.hasbro.com`;

    let res = await fetch(process.env.backUpBaseUrl + "tools", {
      ...options,
      body: `dictWord=${word}`,
      method: "POST",
    });
    res = await res.text();
    let $ = cheerio.load(res, { decodeEntities: false });
    // let test = $("body").text();
    // console.log(test);
    let def = $(".word-definition").children().remove().end().text();
    if (
      def.includes("defined at merriam-webster.com") ||
      def.includes("Check out the spelling of your word and try again.")
    ) {
      return { success: false, definitions: [{ text: "" }], headWord: word };
    }

    return { success: true, definitions: [{ txt: def.trim(), part: null, upvotes: 1000 }], headWord: word };
  } catch (error) {
    console.log("error 2", error);
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
    console.log("error 1", error);

    return await fallBackReq(word);
  }
}

async function defineWordArr(words) {
  try {
    let list = [];
    for (const word of words) {
      let res = await getDef(word);

      if (res?.success === false || res?.success === true) {
        list.push(res);
      } else {
        let fallBackDef = await fallBackReq(word);
        res?.definitions?.push(fallBackDef.definitions[0]);
        list.push(res);
      }
    }

    return list;
  } catch (error) {
    console.log("error 3", error);
  }
}

module.exports = { defineWordArr };
