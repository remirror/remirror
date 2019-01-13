import 'jest-extended';

if (process.env.TEST_ENV) {
  jest.setTimeout(20000);
}

process.on('unhandledRejection', reason => {
  console.error('REJECTION', reason);
});
