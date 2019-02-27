import factory from './factory';
import core from '../../@remirror/core/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import extensionEmoji from '../../@remirror/extension-emoji/package.json';
import extensionEnhancedLink from '../../@remirror/extension-enhanced-link/package.json';
import extensionMention from '../../@remirror/extension-mention/package.json';
import react from '../../@remirror/react/package.json';
import remirror from '../../@remirror/remirror/package.json';
import rendererReact from '../../@remirror/renderer-react/package.json';
import uiTwitter from '../../@remirror/ui-twitter/package.json';

const configurations = [
  ...factory(core),
  ...factory(coreExtensions),
  ...factory(extensionEmoji),
  ...factory(extensionEnhancedLink),
  ...factory(extensionMention),
  ...factory(react),
  ...factory(remirror),
  ...factory(rendererReact),
  ...factory(uiTwitter),
];

export default configurations;
