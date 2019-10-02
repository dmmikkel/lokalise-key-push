const path = require('path');
const fs = require('fs');
const core = require('./core');
const { LokaliseApi } = require('@lokalise/node-api');

const apiKey = core.getInput('api-token');
const projectId = core.getInput('project-id');
const directory = core.getInput('directory');
const format = core.getInput('format');
const platform = core.getInput('platform');
const filename = core.getInput('filename');

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
.catch(error => core.setFailed(error ? error.message : 'Unknown error'))