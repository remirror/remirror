import { createThemeVariables, defaultRemirrorTheme } from '../theme';

test('theme', () => {
  expect(createThemeVariables(defaultRemirrorTheme)).toMatchSnapshot();
});
