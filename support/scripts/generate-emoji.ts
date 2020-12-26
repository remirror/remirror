import { CompactEmoji } from 'emojibase';

import { downloadGithubFolder, GitHubRepo } from './helpers/github-downloader';
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
    directory: 'svg',
    owner: 'googlefonts',
    repo: 'noto-emoji',
    sha: 'v2020-09-16-unicode13_1',
    extractPath: (emoji) => `emoji_u${emoji.hexcode.split('-').join('_').toLowerCase()}.svg`,
    getHexcode: (filePath) =>
      filePath.replace('emoji_u', '').replace('.svg', '').split('_').join('-').toUpperCase(),
  },
  {
    name: 'openmoji-color',
    directory: 'color/svg',
    owner: 'hfg-gmuend',
    repo: 'openmoji',
    sha: '13.0.0',
    extractPath: (emoji) => `${emoji.hexcode}.svg`,
    getHexcode: (filePath) => filePath.replace('.svg', ''),
  },
  {
    name: 'openmoji-black',
    directory: 'black/svg',
    owner: 'hfg-gmuend',
    repo: 'openmoji',
    sha: '13.0.0',
    extractPath: (emoji) => `${emoji.hexcode}.svg`,
    getHexcode: (filePath) => filePath.replace('.svg', ''),
  },
  {
    name: 'blobmoji',
    directory: 'svg',
    owner: 'c1710',
    repo: 'blobmoji',
    sha: 'v2019-06-14-Emoji-12',
    extractPath: (emoji) => `emoji_u${emoji.hexcode.split('-').join('_').toLowerCase()}.svg`,
    getHexcode: (filePath) =>
      filePath.replace('emoji_u', '').replace('.svg', '').split('_').join('-').toUpperCase(),
  },
];
