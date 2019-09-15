const emojiLib = require('emojilib');
const data = require('emoji-mart/data/all.json');
const { join, resolve } = require('path');
const writeJSON = require('write-json-file');
const { execSync } = require('child_process');
const { startCase, uniqueArray, omit, entries } = require('../core-helpers/lib');

const dir = (...paths) => resolve(__dirname, join(...paths));
const formatFile = path => execSync(`prettier ${path} --write`, { stdio: 'inherit' });

const baseEmojis = emojiLib.lib;
const enhancedEmojis = data.emojis;

const DESCRIPTION = 'a';
const KEYWORDS = 'j';

const files = {
  emojis: dir('src', 'data', 'emojis.json'),
  aliases: dir('src', 'data', 'aliases.json'),
  categories: dir('src', 'data', 'categories.json'),
};

const generateData = async () => {
  const emojis = entries(baseEmojis)
    .map(([name, entry]) => {
      const other = enhancedEmojis[name] || enhancedEmojis[`flag-${name}`];
      const firstKeyword = entry.keywords[0];
      const category = entry.category;
      const description = other
        ? other[DESCRIPTION]
        : startCase(
            category === 'flags'
              ? `${name} flag`
              : name.includes(firstKeyword)
              ? name
              : `${name} ${firstKeyword}`,
          );
      const keywords = other
        ? uniqueArray([...entry.keywords, ...(other[KEYWORDS] || [])])
        : entry.keywords;

      const { fitzpatrick_scale: skinVariations } = entry;

      return {
        ...omit(entry, ['fitzpatrick_scale']),
        name,
        description,
        keywords,
        skinVariations,
      };
    })
    .reduce((acc, curr) => ({ ...acc, [curr.name]: curr }), {});

  const categories = Object.values(emojis)
    .map(entry => ({
      id: entry.category,
      name: startCase(entry.category.replace('_and_', '_&_')),
    }))
    .reduce((acc, { id, name }) => ({ ...acc, [id]: name }), {});

  await writeJSON(files.emojis, emojis);
  await writeJSON(files.aliases, data.aliases);
  await writeJSON(files.categories, categories);
  Object.values(files).forEach(path => formatFile(path));
};

generateData();
