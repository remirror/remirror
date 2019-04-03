const execa = require('execa');
const chalk = require('chalk');

if (!process.env.CI) {
  console.log('Building mocks...');

  execa('lerna', ['run', 'build', '--scope', '@schemafire/jest-mocks'], {
    stdio: 'inherit',
  })
    .then(val => {
      console.log(val.stdout);
      process.exit();
    })
    .catch(e => {
      console.log(
        chalk`{red.bold Something went wrong while building the jest mocks}`,
        e,
      );
    });
}
