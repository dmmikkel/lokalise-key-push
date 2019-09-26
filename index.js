const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const glob = require("glob");
const { LokaliseApi } = require('@lokalise/node-api');

async function findFiles (pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, { cwd: process.env.GITHUB_WORKSPACE }, function (err, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    })
  })
}

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

async function run () {
  try {
    const apiKey = core.getInput('api-token');
    const projectId = core.getInput('project-id');
    const directory = core.getInput('directory');
    const fileExtension = core.getInput('file-extension');
    const keyNameProperty = core.getInput('key-name-property');
    const platforms = core.getInput('platforms').split(/\s/).map(x => x.trim());

    const lokalise = new LokaliseApi({ apiKey });
    let globPattern = `${directory}/*.${fileExtension}`;
    if (!directory || directory === '.') {
      globPattern = `*.${fileExtension}`;
    }
    const files = await findFiles(globPattern);
    if (files.length === 0) {
      throw new Error('Found no language files with pattern ' + globPattern);
    }
    console.log(`Found ${files.length} language files`);

    const lokaliseKeys = await lokalise.keys.list({ project_id: projectId });
    const existingKeys = lokaliseKeys.map(x => x.key_name[keyNameProperty]);
    console.log(`Found ${existingKeys.length} existing keys in Lokalise`);

    const toCreate = {};
    await Promise.all(
      files.map(async (file) => {
        const json = await readJsonFile(path.join(process.env.GITHUB_WORKSPACE, file));
        console.log('Read file ' + file);
        const lang = file.split('.')[0]; // TODO: Better determine language
        console.log(`    Use as language '${lang}'`);

        const pairs = objectToKeyValuePairs(json);
        console.log(`    ${pairs.length} keys`);
        
        const newKeyValues = pairs.filter(({ key }) => existingKeys.indexOf(key) === -1)
        console.log(`    ${newKeyValues.length} new keys`);

        newKeyValues.forEach(({ key, value }) => {
          if (!(key in toCreate)) {
            toCreate[key] = {};
          }
          toCreate[key][lang] = value;
        })
      })
    );

    // Prepare push
    console.log('New keys:');
    const uploadKeys = [];
    for (const key in toCreate) {
      console.log('    ' + key);
      const lokaliseKey = {
        key_name: key,
        platforms,
        translations: []
      };
      for (const lang in toCreate[key]) {
        console.log(`        ${lang}: ${toCreate[key][lang]}`);
        lokaliseKey.translations.push({
          language_iso: lang,
          translation: toCreate[key][lang]
        });
      }
      uploadKeys.push(lokaliseKey);
    }

    if (uploadKeys.length > 0) {
      console.log(`Pushing ${uploadKeys.length} new keys to Lokalise`);
      await lokalise.keys.create(uploadKeys, { project_id: projectId });
      console.log('Push done!');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();