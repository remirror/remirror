import { createThemeVariables, defaultRemirrorTheme } from '../theme';

test('theme', () => {
  expect(createThemeVariables(defaultRemirrorTheme)).toMatchSnapshot();
});

test('atoms', () => {});
