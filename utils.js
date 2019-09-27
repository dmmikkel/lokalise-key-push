const fs = require('fs');
const path = require('path');

module.exports.readFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  })
}

module.exports.buildLanguageFilePaths = function (basePath, extension, languages) {
  return languages.map(x => path.join(basePath, x + '.' + extension));
}
