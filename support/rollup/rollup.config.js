import factory from './factory';
import { rollup } from './config.json';

const configurations = [];

rollup.forEach(pkg => {
  factory(require(pkg.path), pkg.root).forEach(config => configurations.push(config));
});

export default configurations;
