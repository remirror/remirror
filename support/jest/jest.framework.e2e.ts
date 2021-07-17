const { CI } = process.env;

if (CI === 'true') {
  jest.retryTimes(3);
}

jest.setTimeout(120_000);

export {};
