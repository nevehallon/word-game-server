require("dotenv").config();
const _ = require("lodash");
const cheerio = require("cheerio");

const fetch = require("node-fetch");

let baseUrl = "http://api.wordnik.com/v4/word.json";

let dictionary = process.env.dictionary;

let options = JSON.parse(process.env.reqOptions);

let checkRes = { headers: { cookie: "" } };

async function validateSources(word) {
  const sources = [
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}_--1_us_3.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}--_3_rr.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}--_3.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}--_us_2rr.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}--_us_2.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}--_us_1rr.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${word}--_us_1.mp3`,
    `https://cdn.yourdictionary.com/audio/en/${word}.mp3`,
    `https://www.google.com/speech-api/v1/synthesize?text=${word}&enc=mpeg&lang=en-us&speed=0.4&client=lr-language-tts&use_google_only_voices=1`,
  ];
  try {
    let validateSources = await Promise.all(
      sources.map(async (source) => {
        let res = await fetch(source);
        if (res.status === 200) {
          return source;
        }
        return;
      })
    );

    return validateSources.filter((item) => item !== undefined);
  } catch (error) {
    console.log("error 4 Src", error, word);
  }
}
async function queryDictionary(word) {
  try {
    let queryOptions = { ...options };
    queryOptions.headers.cookie = checkRes.headers.get("set-cookie");

    let res = await fetch(process.env.backUpBaseUrl + "tools#dictionary", {
      ...queryOptions,
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
    console.log("error 2.1", error, word);
    return { success: false, definitions: [{ text: "" }], headWord: word };
  }
}

async function fallBackReq(word) {
  try {
    checkRes = await fetch(process.env.backUpBaseUrl, { ...options });

    return queryDictionary(word);
  } catch (error) {
    console.log("error 2.0", error, word);
    return queryDictionary(word);
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
      let audioSources = await validateSources(word);

      if (res?.success === false || res?.success === true) {
        let { headword, definitions, pronunciation, origin, success } = res;
        if (definitions) {
          definitions = definitions
            .sort((a, b) => (a.upvotes > b.upvotes ? -1 : 1))
            .filter((_, i) => i < 5)
            .map(({ txt, part, upvotes }) => ({ txt, part, upvotes }));
        }
        if (origin) {
          origin = origin.filter((_, i) => i < 2).map(({ txt }) => ({ txt }));
        }
        res = { headword, definitions, pronunciation, origin, success, audioSources };

        list.push(res);
      } else {
        let fallBackDef = await fallBackReq(word);
        res?.definitions?.push(fallBackDef.definitions[0]);
        res.headWord = word;
        let { headword, definitions, pronunciation, origin, success } = res;
        if (definitions) {
          definitions = definitions
            .sort((a, b) => (a.upvotes > b.upvotes ? -1 : 1))
            .filter((_, i) => i < 5)
            .map(({ txt, part, upvotes }) => ({ txt, part, upvotes }));
        }
        if (origin) {
          origin = origin.filter((_, i) => i < 2).map(({ txt }) => ({ txt }));
        }
        res = { headword, definitions, pronunciation, origin, success, audioSources };

        list.push(res);
      }
    }

    return list;
  } catch (error) {
    console.log("error 3", error, currentWord);
  }
}

module.exports = { defineWordArr };
