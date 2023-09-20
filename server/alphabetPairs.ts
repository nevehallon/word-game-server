let letters = "abcdefghijklmnopqrstuvwxyz";

let result: string[] = [];

for(let letter of letters){
 for(let letter2 of letters){
    if(!result.includes(`${letter + letter2}`.split('').sort().join(''))) {
        result.push( letter + letter2);
    }
 }
}

export { letters, result };