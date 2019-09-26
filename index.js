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

async function run () {
  try {
    const apiKey = core.getInput('api-token');
    const projectId = core.getInput('project-id');
    const globPattern = core.getInput('glob-pattern');
    const format = core.getInput('format');

    if (format !== 'Json') {
      throw new Error('Not a supported format');
    }

    const lokalise = new LokaliseApi({ apiKey });
    const files = await findFiles(globPattern);

    const keys = await lokalise.keys.list({ project_id: projectId });
    console.log('files', files);
    console.log('keys', keys);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();