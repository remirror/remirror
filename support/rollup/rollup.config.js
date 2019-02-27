import factory from './factory';
import core from '../../@remirror/core/package.json';
import react from '../../@remirror/react/package.json';
import remirror from '../../@remirror/remirror/package.json';
import rendererReact from '../../@remirror/renderer-react/package.json';
import mentionsExtension from '../../@remirror/extension-mention/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import uiTwitter from '../../@remirror/ui-twitter/package.json';

const configurations = [
  ...factory(core),
  ...factory(react),
  ...factory(remirror),
  ...factory(mentionsExtension),
  ...factory(rendererReact),
  ...factory(coreExtensions),
  ...factory(uiTwitter),
];

export default configurations;
