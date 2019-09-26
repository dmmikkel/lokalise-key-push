const fs = require('fs');
const path = require('path');

async function readJsonFile (path) {
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

function objectToKeyValuePairs (o, prefix = '') {
  const names = [];
  for (let key in o) {
    if (typeof o[key] === 'object') {
      const children = objectToKeyValuePairs(o[key], prefix + key + '::');
      children.forEach(c => names.push(c));
    } else {
      names.push({ key: prefix + key, value: o[key] });
    }
  }
  return names;
}

function buildLanguageFilePaths (basePath, extension, languages) {
  return languages.map(x => path.join(basePath, x + '.' + extension));
}

export {
  readJsonFile,
  objectToKeyValuePairs,
  buildLanguageFilePaths,
}