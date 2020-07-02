import { environment } from '../environment';

test('environment', () => {
  expect(environment.isBrowser).toBeTrue();
  expect(environment.isJSDOM).toBeTrue();
  expect(environment.isNode).toBeTrue();
  expect(environment.isMac).toBeFalse();
  expect(environment.isApple).toBeBoolean();
  expect(environment.isDevelopment).toBeBoolean();
  expect(environment.isTest).toBeTrue();
  expect(environment.isProduction).toBeBoolean();
});
