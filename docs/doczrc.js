module.exports = {
  title: 'Docz Typescript',
  typescript: true,
  modifyBabelRc(config) {
    console.log('inside config', config);
    return require('./.babelrc');
  },
};

console.log(process.cwd());
