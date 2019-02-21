import factory from './factory';
import core from '../../@remirror/core/package.json';
import react from '../../@remirror/react/package.json';
import remirror from '../../@remirror/remirror/package.json';
import renderer from '../../@remirror/renderer/package.json';
import mentionsExtension from '../../@remirror/mentions-extension/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';
import twitterUI from '../../@remirror/twitter-ui/package.json';

const configurations = [
  ...factory(core),
  ...factory(react),
  ...factory(remirror),
  ...factory(mentionsExtension),
  ...factory(renderer),
  ...factory(coreExtensions),
  ...factory(twitterUI),
];

export default configurations;
