import factory from './factory';
import dev from '../../@remirror/dev/package.json';
import core from '../../@remirror/core/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import extensionCodeBlock from '../../@remirror/extension-code-block/package.json';
import extensionCollaboration from '../../@remirror/extension-collaboration/package.json';
import extensionEmoji from '../../@remirror/extension-emoji/package.json';
import extensionEnhancedLink from '../../@remirror/extension-enhanced-link/package.json';
import extensionEpicMode from '../../@remirror/extension-epic-mode/package.json';
import extensionImage from '../../@remirror/extension-image/package.json';
import extensionMention from '../../@remirror/extension-mention/package.json';
import react from '../../@remirror/react/package.json';
import reactSSR from '../../@remirror/react-ssr/package.json';
import reactUtils from '../../@remirror/react-utils/package.json';
import remirror from '../../packages/remirror/package.json';
import rendererReact from '../../@remirror/renderer-react/package.json';
import showcase from '../../@remirror/showcase/package.json';
import editorSocial from '../../@remirror/editor-social/package.json';
import editorWysiwyg from '../../@remirror/editor-wysiwyg/package.json';

const configurations = [
  ...factory(dev, '@remirror'),
  ...factory(core, '@remirror'),
  ...factory(coreExtensions, '@remirror'),
  ...factory(extensionCodeBlock, '@remirror'),
  ...factory(extensionCollaboration, '@remirror'),
  ...factory(extensionEmoji, '@remirror'),
  ...factory(extensionEnhancedLink, '@remirror'),
  ...factory(extensionEpicMode, '@remirror'),
  ...factory(extensionImage, '@remirror'),
  ...factory(extensionMention, '@remirror'),
  ...factory(react, '@remirror'),
  ...factory(reactSSR, '@remirror'),
  ...factory(reactUtils, '@remirror'),
  ...factory(remirror, 'packages'),
  ...factory(rendererReact, '@remirror'),
  ...factory(showcase, '@remirror'),
  ...factory(editorSocial, '@remirror'),
  ...factory(editorWysiwyg, '@remirror'),
];

export default configurations;
