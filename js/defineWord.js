require("dotenv").config();

const axios = require("axios");

let baseUrl = "http://api.wordnik.com/v4/word.json";

baseUrl = "https://www.wordsapi.com/mashape/words";
let capUrl = "?when=2021-02-01T22:00:50.194Z&encrypted=8cfdb18be722919bea9007bded58beb9aeb52d0931f693b8";

async function defineWordArr(words) {
  try {
    let list = [];
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let result = await axios.get(`${baseUrl}/${word}${capUrl}`);
      let resultObj = {};
      resultObj[`${word}`] = result.data.results;
      list.push(resultObj);
    }
    return list;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { defineWordArr };
