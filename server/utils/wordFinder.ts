import uniq from "lodash/uniq";
import trie from "trie-prefix-tree";
import fs from 'fs';

import { letters as oneBlank, result as twoBlanks } from "./alphabetPairs";
import path from "path";
// import wordCsv from "./wordList";
const wordCsv = fs.createReadStream(
	path.resolve(__dirname, '../../assets/wordList.csv')
)
// 187,632 words
const wordList: string[] = []
wordCsv.on('data', (chunk) => {
	wordList.push(chunk.toString())
})

// const reverseWordList = require("./reverseWordList");
// 187,632 words
const reverseWordCsv = fs.createReadStream(

	path.resolve(__dirname, '../../assets/reverseWordList.csv')
)
const reverseWordList: string[] = []
reverseWordCsv.on('data', (chunk) => {
	reverseWordList.push(chunk.toString())
})


const myTrie = trie(wordList); // currently 173,141 words

function wordFinder(str: string, numBlanks?: number) {
	let result: string[] = [];
	numBlanks == 2 ?
		twoBlanks.forEach(blanks => result.push(...myTrie.getSubAnagrams(`${str}${blanks}`))) :
		numBlanks == 1 ?
			[...oneBlank].forEach(blank => result.push(...myTrie.getSubAnagrams(`${str}${blank}`))) :
			result.push(...myTrie.getSubAnagrams(`${str}`));

	return uniq(result);
}



const wordTrieStr = myTrie.dump() // currently 173,141 words
const reverseWordTrieStr = trie(reverseWordList).dump()

export { reverseWordTrieStr, wordFinder, wordTrieStr };