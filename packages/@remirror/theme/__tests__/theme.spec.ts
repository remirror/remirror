import { createThemeVariables, defaultRemirrorTheme } from '../utils';

test('theme', () => {
  expect(createThemeVariables(defaultRemirrorTheme)).toMatchSnapshot();
});
