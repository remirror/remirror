import factory from './factory';
import core from '../../@remirror/core/package.json';
import react from '../../@remirror/react/package.json';
import remirror from '../../@remirror/remirror/package.json';
import coreExtensions from '../../@remirror/core-extensions/package.json';

const configurations = [
  ...factory(core),
  ...factory(react),
  ...factory(remirror),
  ...factory(coreExtensions),
];

export default configurations;
