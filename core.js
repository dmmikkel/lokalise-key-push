const path = require('path');
const jsonFormatParser = require('./json-format-parser');
const propertiesFormatParser = require('./properties-format-parser');

const LANG_ISO_PLACEHOLDER = '%LANG_ISO%';

let _context;
let _lokalise;

module.exports = async (context, { LokaliseApi, fs }) => {
  _context = context;
  _lokalise = new LokaliseApi({ apiKey: context.apiKey });
  _fs = fs;
  
  const remoteKeys = await getRemoteKeys();
  console.log(`${remoteKeys.length} remote keys.`);

  const localKeys = await getLocalKeys();

  const keysToCreate = getKeysToCreate(localKeys, remoteKeys);

  const createRequest = buildLokaliseCreateKeysRequest(keysToCreate);
  console.log(JSON.stringify(createRequest, null, 2));
}

function buildLokaliseCreateKeysRequest (toCreate) {
  console.log('Creating keys');
  const uploadKeys = [];
  for (const key in toCreate) {
    console.log('    ' + key);
    const lokaliseKey = {
      key_name: key,
      platforms: [_context.platform],
      translations: [],
      filenames: {
        [_context.platform]: _context.filename
      }
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
  return uploadKeys;
}

function getKeysToCreate (localKeys, remoteKeys) {
  const toCreate = {};
  for (const lang in localKeys) {
    localKeys[lang].forEach(({ key, value }) => {
      const keyExists = remoteKeys.some(x => x.key_name[_context.platform] === key);
      if (!keyExists) {
        if (!(key in toCreate)) {
          toCreate[key] = {};
        }
        toCreate[key][lang] = value;
      }
    })
  }
  return toCreate;
}

async function getLocalKeys () {
  const languageCodes = await getLanguageISOCodes();
  console.log('Project language codes', languageCodes);

  const languageKeys = {};

  const readFilePromises = languageCodes.map(async (lang) => {
    try {
      const data = await readLanguageFile(lang);
      let pairs;
      switch (_context.format) {
        case 'json':
          pairs = jsonFormatParser(data);
          break;
        case 'properties':
          pairs = propertiesFormatParser(data);
          break;
        default:
          throw new Error('No parser found for format');
      }
      console.log(`Found ${pairs.length} keys in languge file for '${lang}'`);
      languageKeys[lang] = pairs;
    } catch (error) {
      console.error(`Error reading language file ${lang}: ${error.message}`)
    }
  })

  await Promise.all(readFilePromises);
  return languageKeys;
}

async function getRemoteKeys () {
  const {
    projectId,
    platform,
  } = _context;
  return await _lokalise
    .keys
    .list({
      project_id: projectId,
      filter_platforms: platform,
      limit: 5000 // TODO: Implement pagination if more than 5000 keys
    });
}

function buildLanguageFilePath (languageCode) {
  return path.join(_context.directory, _context.filename.replace(LANG_ISO_PLACEHOLDER, languageCode))
}

async function getLanguageISOCodes () {
  const languages = await _lokalise.languages.list({
    project_id: _context.projectId
  });
  return languages.map(x => x.lang_iso);
}

function readLanguageFile (lang) {
  const path = buildLanguageFilePath(lang);
  return new Promise((resolve, reject) => {
    _fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Read language file ' + path);
      resolve(data);
    });
  })
}