const { join } = require('path');

const core = require('./@remirror/core/package.json');
const coreExtensions = require('./@remirror/core-extensions/package.json');
const extensionCollaboration = require('./@remirror/extension-collaboration/package.json');
const extensionEmoji = require('./@remirror/extension-emoji/package.json');
const extensionEpicMode = require('./@remirror/extension-epic-mode/package.json');
const extensionEnhancedLink = require('./@remirror/extension-enhanced-link/package.json');
const extensionMention = require('./@remirror/extension-mention/package.json');
const react = require('./@remirror/react/package.json');
const reactSSR = require('./@remirror/react-ssr/package.json');
const reactUtils = require('./@remirror/react-utils/package.json');
const rendererReact = require('./@remirror/renderer-react/package.json');
const showcase = require('./@remirror/showcase/package.json');
const editorTwitter = require('./@remirror/editor-twitter/package.json');
const editorWysiwyg = require('./@remirror/editor-wysiwyg/package.json');

const limits = {
  '@remirror/core': '50 KB',
  '@remirror/core-extensions': '90 KB',
  '@remirror/extension-collaboration': '50 KB',
  '@remirror/extension-emoji': '200 KB',
  '@remirror/extension-epic-mode': '50 KB',
  '@remirror/extension-enhanced-link': '60 KB',
  '@remirror/extension-mention': '70 KB',
  '@remirror/react': '110 KB',
  '@remirror/react-ssr': '80 KB',
  '@remirror/react-utils': '50 KB',
  '@remirror/renderer-react': '60 KB',
  '@remirror/showcase': '400 KB',
  '@remirror/editor-twitter': '225 KB',
  '@remirror/editor-wysiwyg': '350 KB',
};

module.exports = [
  core,
  coreExtensions,
  extensionCollaboration,
  extensionEmoji,
  extensionEpicMode,
  extensionEnhancedLink,
  extensionMention,
  react,
  reactSSR,
  reactUtils,
  rendererReact,
  showcase,
  editorTwitter,
  editorWysiwyg,
].map(json => ({
  name: json.name,
  path: join(json.name, json.main),
  limit: limits[json.name],
  ignore: Object.keys(json.peerDependencies || {}),
}));
