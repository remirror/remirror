import factory from './factory';
import core from '../../@remirror/core/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import extensionEmoji from '../../@remirror/extension-emoji/package.json';
import extensionEnhancedLink from '../../@remirror/extension-enhanced-link/package.json';
import extensionMention from '../../@remirror/extension-mention/package.json';
import react from '../../@remirror/react/package.json';
import reactSSR from '../../@remirror/react-ssr/package.json';
import remirror from '../../packages/remirror/package.json';
import rendererReact from '../../@remirror/renderer-react/package.json';
import uiTwitter from '../../@remirror/ui-twitter/package.json';

const configurations = [
  ...factory(core, '@remirror'),
  ...factory(coreExtensions, '@remirror'),
  ...factory(extensionEmoji, '@remirror'),
  ...factory(extensionEnhancedLink, '@remirror'),
  ...factory(extensionMention, '@remirror'),
  ...factory(react, '@remirror'),
  ...factory(reactSSR, '@remirror'),
  ...factory(remirror, 'packages'),
  ...factory(rendererReact, '@remirror'),
  ...factory(uiTwitter, '@remirror'),
];

export default configurations;
