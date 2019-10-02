const path = require('path');
const fs = require('fs');
const core = require('./core');
const { LokaliseApi } = require('@lokalise/node-api');

core({
  apiKey: '69eee72dbc80183709be4e99737cce97f01a2a46',
  projectId: '748610715d8afa5681a4b1.23888602',
  directory: path.join(__dirname, 'test'),
  format: 'json',
  platform: 'web',
  filename: '%LANG_ISO%.json',
}, {
  LokaliseApi,
  fs
}).then(() => console.log('DONE'))