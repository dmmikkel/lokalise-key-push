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

async function run () {
  try {
    const apiKey = core.getInput('api-token');
    const projectId = core.getInput('project-id');
    const globPattern = core.getInput('glob-pattern');
    const keyNameProperty = core.getInput('key-name-property');

    const lokalise = new LokaliseApi({ apiKey });
    const files = await findFiles(globPattern);

    const lokaliseKeys = await lokalise.keys.list({ project_id: projectId });
    const existingKeys = lokaliseKeys.map(x => x.key_name[keyNameProperty]);

    console.log('files', files);
    console.log('existingKeys', existingKeys);

    files.forEach(file => {
      const json = await readJsonFile(path.join(process.env.GITHUB_WORKSPACE, file));
      console.log('File ' + file);
      console.log(json);
    })

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();