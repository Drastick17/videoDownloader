const path = require("path");

const RESOLVE = (file) => path.resolve(__dirname, `../public/${file}`);

const rmEmoji = (str) => str.replace(/\p{EPres}|\p{ExtPict}/gu, "");

const rmEspecialsCharacters = (str) => str.replace(/[^a-zA-Z ]/g, "");

module.exports = {
  RESOLVE,
  rmEmoji,
  rmEspecialsCharacters
}