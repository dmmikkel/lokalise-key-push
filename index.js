const path = require('path');
const fs = require('fs');
const core = require('./core');
const ghCore = require('@actions/core');
const { LokaliseApi } = require('@lokalise/node-api');

const apiKey = ghCore.getInput('api-token');
const projectId = ghCore.getInput('project-id');
const directory = ghCore.getInput('directory');
const format = ghCore.getInput('format');
const platform = ghCore.getInput('platform');
const filename = ghCore.getInput('filename');

core({
  apiKey,
  projectId,
  directory: path.join(__dirname, directory),
  format,
  platform,
  filename,
}, {
  LokaliseApi,
  fs
})
.then(() => console.log('Finished'))
.catch(error => ghCore.setFailed(error ? error.message : 'Unknown error'))