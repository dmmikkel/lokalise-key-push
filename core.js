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
  console.log(`Fetched ${remoteKeys.length} remote keys.`);

  const localKeys = await getLocalKeys();
  console.log(localKeys);
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
      console.log(`Error reading language file ${lang}: ${error.message}`)
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
  console.log(languages);
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