const fs = require('fs');
const path = require('path');

async function readFile (path) {
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

function buildLanguageFilePaths (basePath, extension, languages) {
  return languages.map(x => path.join(basePath, x + '.' + extension));
}

export {
  readFile,
  buildLanguageFilePaths,
}