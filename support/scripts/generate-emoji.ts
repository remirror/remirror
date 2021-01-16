import {
  CompactEmoji,
  stripHexcode,
  FlatEmoji,
  fetchEmojis,
  Emoticon,
  generateEmoticonPermutations,
} from 'emojibase';
import { mkdir, readdir, readFile, writeFile } from 'fs/promises';
import got from 'got';
import os from 'os';
import path from 'path';
import Sprite from 'svg-sprite';
import tar from 'tar';
import { assert } from 'remirror';
import 'localstorage-polyfill';
import fetch from 'node-fetch';

import { baseDir, log } from './helpers';

// log.info({
//   hexcode: '1F3CB-1F3FB-200D-2642-FE0F',
//   stripped: stripHexcode('1F3CB-1F3FB-200D-2642-FE0F'),
// });

if (!globalThis.fetch) {
  // @ts-expect-error
  globalThis.fetch = fetch;
}

let emojis: FlatEmoji[] = [];
const emoticons: Record<string, Array<Emoticon>> = {};

interface GitHubRepo {
  owner: string;
  repo: string;

  /**
   * @default master
   */
  sha?: string;
}

/**
 * The library for emoji svg's.
 */
interface EmojiLibrary extends GitHubRepo {
  /**
   * The name of the emoji library.
   */
  name: string;
  /**
   * The directory to the emoji directory.
   */
  directory: string;

  /**
   * Get the path relative to the directory from the provided compact emoji.
   */
  extractPath: (emoji: CompactEmoji) => string;

  /**
   * Get the hexcode from the file path
   */
  getHexcode: (path: string) => string;
}

const emojiLibraries: EmojiLibrary[] = [
  {
    name: 'noto',
    owner: 'googlefonts',
    repo: 'noto-emoji',
    sha: 'v2020-09-16-unicode13_1',
    directory: 'svg',
    extractPath: (emoji) =>
      `emoji_u${emoji.hexcode.replace(/-FE0F/, '').split('-').join('_').toLowerCase()}.svg`,
    getHexcode: (filePath) => {
      const maybeHexcode = filePath
        .replace('emoji_u', '')
        .replace('.svg', '')
        .split('_')
        .join('-')
        .toUpperCase();
      const found = emojis.find(
        (compact) => stripHexcode(compact.hexcode) === stripHexcode(maybeHexcode),
      );
      assert(
        found,
        `No hexcode could be found for the filePath: ${filePath}, hexcode: ${maybeHexcode}`,
      );

      return found.hexcode;
    },
  },
  {
    name: 'blobmoji',
    owner: 'c1710',
    repo: 'blobmoji',
    sha: 'v2019-06-14-Emoji-12',
    directory: 'svg',
    extractPath: (emoji) =>
      `emoji_u${emoji.hexcode.replace(/-FE0F/, '').split('-').join('_').toLowerCase()}.svg`,
    getHexcode: (filePath) => {
      const maybeHexcode = filePath
        .replace('emoji_u', '')
        .replace('.svg', '')
        .split('_')
        .join('-')
        .toUpperCase();
      const found = emojis.find(
        (compact) => stripHexcode(compact.hexcode) === stripHexcode(maybeHexcode),
      );
      assert(
        found,
        `No hexcode could be found for the filePath: ${filePath}, hexcode: ${maybeHexcode}`,
      );

      return found.hexcode;
    },
  },
  {
    name: 'openmoji-color',
    owner: 'hfg-gmuend',
    repo: 'openmoji',
    sha: '13.0.0',
    directory: 'color/svg',
    extractPath: (emoji) => `${emoji.hexcode}.svg`,
    getHexcode: (filePath) => filePath.replace('.svg', ''),
  },
  {
    name: 'openmoji-black',
    owner: 'hfg-gmuend',
    repo: 'openmoji',
    sha: '13.0.0',
    directory: 'black/svg',
    extractPath: (emoji) => `${emoji.hexcode}.svg`,
    getHexcode: (filePath) => filePath.replace('.svg', ''),
  },
  {
    name: 'twemoji',
    owner: 'twitter',
    repo: 'twemoji',
    sha: 'v13.0.1',
    directory: 'assets/svg',
    extractPath: (emoji) => `${emoji.hexcode.toLowerCase()}.svg`,
    getHexcode: (filePath) => filePath.replace('.svg', '').toUpperCase(),
  },
];

const destinationDirectory = baseDir('packages', '@remirror', 'extension-emoji', 'data');

async function writeSprite(folder: string, library: EmojiLibrary) {
  const dest = path.join(destinationDirectory, library.name);
  await mkdir(dest, { recursive: true });
  const files = await readdir(folder);
  const spriter = new Sprite({
    dest,
    mode: {
      // Mode used because of this
      // http://betravis.github.io/icon-methods/svg-sprite-sheets.html#with-a-custom-view-box
      stack: {
        dest: '',
        bust: false,
        prefix: 'emoji-%s',
        sprite: `sprite.svg`,
      },
      defs: false,
      symbol: false,
      css: false,
      view: false,
    },
    shape: {
      id: {
        generator: (svg) => library.getHexcode(path.basename(svg)),
      },
    },
  });

  for (const file of files) {
    if (!file.endsWith('.svg')) {
      continue;
    }

    const filepath = path.join(folder, file);
    spriter.add(filepath, file, await readFile(filepath, { encoding: 'utf-8' }));
  }

  return new Promise<void>((resolve) =>
    spriter.compile((_, result) => {
      for (const resources of Object.values<any>(result)) {
        for (const data of Object.values<any>(resources)) {
          mkdir(path.dirname(data.path), { recursive: true }).then(async () => {
            await writeFile(data.path, data.contents);
            resolve();
          });
        }
      }
    }),
  );
}

async function run() {
  const emojiFile = path.join(destinationDirectory, `emoji.json`);
  const emoticonsFile = path.join(destinationDirectory, `emoticons.json`);
  const tmpdir = path.join(os.tmpdir(), '__remirror__');

  log.debug('Loading emojis from cdn');
  emojis = await fetchEmojis('en', {
    flat: true,
    compact: true,
    shortcodes: ['cldr'],
    local: true,
  });

  for (const emoji of emojis) {
    if (!emoji.emoticon) continue;

    emoticons[emoji.hexcode] = generateEmoticonPermutations(emoji.emoticon);
  }

  log.debug('Writing emojis to file');
  await writeFile(emojiFile, JSON.stringify(emojis, null, 2));
  await writeFile(emoticonsFile, JSON.stringify(emoticons, null, 2));

  await mkdir(tmpdir, { recursive: true });

  const promises: Array<Promise<void>> = [];

  for (const library of emojiLibraries) {
    const { directory, name, owner, repo, sha } = library;

    const tarName = `${name}.tar.gz`;
    const tarPath = path.join(tmpdir, tarName);
    const extractFolder = path.join(tmpdir, name);
    const url = `https://github.com/${owner}/${repo}/archive/${sha}.tar.gz`;

    const promise = got(url)
      .buffer()
      .then(async (buffer) => {
        await writeFile(tarPath, buffer);
        await mkdir(extractFolder, { recursive: true });
        await tar.extract({ cwd: extractFolder, file: tarPath });

        const folders = await readdir(extractFolder);
        const folder = folders.find((f) => !f.startsWith('.')) ?? '';
        const svgFolder = path.join(extractFolder, folder, directory);

        await writeSprite(svgFolder, library);
      });

    promises.push(promise);
  }

  await Promise.all(promises);
}

run();
