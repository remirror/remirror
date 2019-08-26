import factory from './factory';
import packages from './config.json';

const configurations = [];

packages.forEach(pkg => {
  factory(require(pkg.path), pkg.root).forEach(config => configurations.push(config));
});

export default configurations;
