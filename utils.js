const fs = require('fs');
const path = require('path');

module.exports.readFile = function (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  })
}

module.exports.buildLanguageFilePaths = function (basePath, prefix, extension, languages) {
  return languages.map(lang => path.join(basePath, prefix + lang + '.' + extension));
}
