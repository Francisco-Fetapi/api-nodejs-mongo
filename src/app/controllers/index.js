const fs = require("fs");
const path = require("path");
// const crypo = require('crypto')

module.exports = (app) => {
  fs.readdirSync(__dirname)
    .filter((file) => {
      return !file.startsWith(".") && file !== "index.js";
    })
    .forEach((file) => {
      require(path.resolve(__dirname, file))(app);
    });
};
