const path = require('path');
const core = require('@actions/core');
const { LokaliseApi } = require('@lokalise/node-api');
const jsonFormatParser = require('./json-format-parser');
const propertiesFormatParser = require('./properties-format-parser');
const {
  readFile,
  buildLanguageFilePaths
} = require('./utils');

async function run () {
  try {
    const apiKey = core.getInput('api-token');
    const projectId = core.getInput('project-id');
    const directory = core.getInput('directory');
    const fileExtension = core.getInput('file-extension');
    const keyNameProperty = core.getInput('key-name-property');
    const format = core.getInput('format');
    const filePrefix = core.getInput('file-prefix');
    const platforms = core.getInput('platforms').split(/\s/).map(x => x.trim());
    const languages = core.getInput('languages').split(/\s/).map(x => x.trim());

    if (!languages || languages.length === 0) {
      throw new Error('Missing languages input');
    }

    const lokalise = new LokaliseApi({ apiKey });

    const files = buildLanguageFilePaths(path.join(process.env.GITHUB_WORKSPACE, directory), filePrefix, fileExtension, languages);
    console.log(`Found ${files.length} language files`);

    const lokaliseKeys = await lokalise.keys.list({ project_id: projectId, limit: 5000 }); // TODO: Implement pagination if more than 5000 keys
    const existingKeys = lokaliseKeys.map(x => x.key_name[keyNameProperty]);
    console.log(`Found ${existingKeys.length} existing keys in Lokalise`);

    const toCreate = {};
    await Promise.all(
      files.map(async (file) => {
        const data = await readFile(file);
        console.log('Read file ' + file);
        
        const lang = path.parse(file).name.substr(filePrefix.length);

        console.log(`    Use as language '${lang}'`);

        let pairs;
        switch (format) {
          case 'json':
            pairs = jsonFormatParser(data);
            break;
          case 'properties':
            pairs = propertiesFormatParser(data);
            break;
          default:
            throw new Error('No parser found for format');
        }

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
    core.setFailed(error ? error.message : 'Unknown error');
  }
}

run();