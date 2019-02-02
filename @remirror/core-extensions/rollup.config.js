import { generateConfig } from '../../config/rollup.config';

export default generateConfig({ pkg: require('./package.json'), name: 'RemirrorCoreExtensions' });
