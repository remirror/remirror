import { defaultThemeVariables } from '../src/theme-variables';
import { createThemeVariables, defaultRemirrorTheme } from '../src/utils';

test('defaultThemeVariables', () => {
  const expected = createThemeVariables(defaultRemirrorTheme).css;
  expect(defaultThemeVariables).toEqual(expected);
});
