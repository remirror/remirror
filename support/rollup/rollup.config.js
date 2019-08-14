import factory from './factory';
import core from '../../@remirror/core/package.json';
import coreConstants from '../../@remirror/core-constants/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import coreHelpers from '../../@remirror/core-helpers/package.json';
import coreTypes from '../../@remirror/core-types/package.json';
import coreUtils from '../../@remirror/core-utils/package.json';
import dev from '../../@remirror/dev/package.json';
import editorSocial from '../../@remirror/editor-social/package.json';
import editorWysiwyg from '../../@remirror/editor-wysiwyg/package.json';
import extensionCodeBlock from '../../@remirror/extension-code-block/package.json';
import extensionCollaboration from '../../@remirror/extension-collaboration/package.json';
import extensionEmoji from '../../@remirror/extension-emoji/package.json';
import extensionEnhancedLink from '../../@remirror/extension-enhanced-link/package.json';
import extensionEpicMode from '../../@remirror/extension-epic-mode/package.json';
import extensionImage from '../../@remirror/extension-image/package.json';
import extensionMention from '../../@remirror/extension-mention/package.json';
import react from '../../@remirror/react/package.json';
import reactNodeView from '../../@remirror/react-node-view/package.json';
import reactSSR from '../../@remirror/react-ssr/package.json';
import reactUtils from '../../@remirror/react-utils/package.json';
import remirror from '../../packages/remirror/package.json';
import rendererReact from '../../@remirror/renderer-react/package.json';
import showcase from '../../@remirror/showcase/package.json';
import ui from '../../@remirror/ui/package.json';
import uiButtons from '../../@remirror/ui-buttons/package.json';
import uiIcons from '../../@remirror/ui-icons/package.json';
import uiMenus from '../../@remirror/ui-menus/package.json';
import uiModal from '../../@remirror/ui-modal/package.json';
import reactPortals from '../../@remirror/react-portals/package.json';

const configurations = [
  ...factory(core, '@remirror'),
  ...factory(coreConstants, '@remirror'),
  ...factory(coreExtensions, '@remirror'),
  ...factory(coreHelpers, '@remirror'),
  ...factory(coreTypes, '@remirror'),
  ...factory(coreUtils, '@remirror'),
  ...factory(dev, '@remirror'),
  ...factory(editorSocial, '@remirror'),
  ...factory(editorWysiwyg, '@remirror'),
  ...factory(extensionCodeBlock, '@remirror'),
  ...factory(extensionCollaboration, '@remirror'),
  ...factory(extensionEmoji, '@remirror'),
  ...factory(extensionEnhancedLink, '@remirror'),
  ...factory(extensionEpicMode, '@remirror'),
  ...factory(extensionImage, '@remirror'),
  ...factory(extensionMention, '@remirror'),
  ...factory(react, '@remirror'),
  ...factory(reactNodeView, '@remirror'),
  ...factory(reactSSR, '@remirror'),
  ...factory(reactUtils, '@remirror'),
  ...factory(rendererReact, '@remirror'),
  ...factory(showcase, '@remirror'),
  ...factory(ui, '@remirror'),
  ...factory(uiButtons, '@remirror'),
  ...factory(uiIcons, '@remirror'),
  ...factory(uiMenus, '@remirror'),
  ...factory(uiModal, '@remirror'),
  ...factory(remirror, 'packages'),
  ...factory(reactPortals, '@remirror'),
];

export default configurations;
