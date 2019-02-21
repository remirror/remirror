import 'jest-extended';

if (process.env.TEST_ENV) {
  jest.setTimeout(60000);
}

/* Make unhandledRejection errors easier to debug */

process.on('unhandledRejection', reason => {
  console.error('REJECTION', reason);
});
