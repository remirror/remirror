import factory from './factory';
import core from '../../@remirror/core/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import extensionEmoji from '../../@remirror/extension-emoji/package.json';
import extensionEpicMode from '../../@remirror/extension-epic-mode/package.json';
import extensionEnhancedLink from '../../@remirror/extension-enhanced-link/package.json';
import extensionMention from '../../@remirror/extension-mention/package.json';
import react from '../../@remirror/react/package.json';
import reactSSR from '../../@remirror/react-ssr/package.json';
import reactUtils from '../../@remirror/react-utils/package.json';
import remirror from '../../packages/remirror/package.json';
import rendererReact from '../../@remirror/renderer-react/package.json';
import showcase from '../../@remirror/showcase/package.json';
import uiTwitter from '../../@remirror/ui-twitter/package.json';
import uiWysiwyg from '../../@remirror/ui-wysiwyg/package.json';

const configurations = [
  ...factory(core, '@remirror'),
  ...factory(coreExtensions, '@remirror'),
  ...factory(extensionEmoji, '@remirror'),
  ...factory(extensionEpicMode, '@remirror'),
  ...factory(extensionEnhancedLink, '@remirror'),
  ...factory(extensionMention, '@remirror'),
  ...factory(react, '@remirror'),
  ...factory(reactSSR, '@remirror'),
  ...factory(reactUtils, '@remirror'),
  ...factory(remirror, 'packages'),
  ...factory(rendererReact, '@remirror'),
  ...factory(showcase, '@remirror'),
  ...factory(uiTwitter, '@remirror'),
  ...factory(uiWysiwyg, '@remirror'),
];

export default configurations;
