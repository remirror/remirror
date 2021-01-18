const { CI } = process.env;

if (CI === 'true') {
  jest.retryTimes(3);
}
