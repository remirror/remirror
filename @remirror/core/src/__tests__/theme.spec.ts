import { defaultRemirrorTheme, createThemeVariables } from '../theme';

test('theme', () => {
  expect(createThemeVariables(defaultRemirrorTheme)).toMatchSnapshot();
});
