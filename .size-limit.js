const { join } = require('path');

const core = require('./@remirror/core/package.json');
const coreExtensions = require('./@remirror/core-extensions/package.json');
const editorSocial = require('./@remirror/editor-social/package.json');
const editorWysiwyg = require('./@remirror/editor-wysiwyg/package.json');
const extensionCodeBlock = require('./@remirror/extension-code-block/package.json');
const extensionCollaboration = require('./@remirror/extension-collaboration/package.json');
const extensionEmoji = require('./@remirror/extension-emoji/package.json');
const extensionEnhancedLink = require('./@remirror/extension-enhanced-link/package.json');
const extensionEpicMode = require('./@remirror/extension-epic-mode/package.json');
const extensionImage = require('./@remirror/extension-image/package.json');
const extensionMention = require('./@remirror/extension-mention/package.json');
const react = require('./@remirror/react/package.json');
const reactSSR = require('./@remirror/react-ssr/package.json');
const reactUtils = require('./@remirror/react-utils/package.json');
const rendererReact = require('./@remirror/renderer-react/package.json');

const limits = {
  '@remirror/core': '60 KB',
  '@remirror/core-extensions': '100 KB',
  '@remirror/editor-social': '250 KB',
  '@remirror/editor-wysiwyg': '400 KB',
  '@remirror/extension-code-block': '110 KB',
  '@remirror/extension-collaboration': '60 KB',
  '@remirror/extension-emoji': '220 KB',
  '@remirror/extension-enhanced-link': '70 KB',
  '@remirror/extension-epic-mode': '60 KB',
  '@remirror/extension-image': '80 KB',
  '@remirror/extension-mention': '80 KB',
  '@remirror/react': '120 KB',
  '@remirror/react-ssr': '90 KB',
  '@remirror/react-utils': '60 KB',
  '@remirror/renderer-react': '70 KB',
};

module.exports = [
  core,
  coreExtensions,
  extensionCodeBlock,
  extensionCollaboration,
  extensionEmoji,
  extensionEnhancedLink,
  extensionEpicMode,
  extensionImage,
  extensionMention,
  react,
  reactSSR,
  reactUtils,
  rendererReact,
  editorSocial,
  editorWysiwyg,
].map(json => ({
  name: json.name,
  path: join(json.name, json.main),
  limit: limits[json.name],
  ignore: Object.keys(json.peerDependencies || {}),
}));
