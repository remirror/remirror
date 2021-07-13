import { createThemeVariables, defaultRemirrorTheme } from '../';

test('theme', () => {
  expect(createThemeVariables(defaultRemirrorTheme)).toMatchSnapshot();
});
