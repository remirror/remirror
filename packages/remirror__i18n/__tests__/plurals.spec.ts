import { en } from '../src/plurals';

test('plurals are forwarded correctly', () => {
  expect(en).toBeFunction();
});
