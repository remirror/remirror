/**
 * @module
 *
 * The `ThemeProvider` to wrap your editor with when using these components.
 */
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import React, { ReactElement, ReactNode } from 'react';
import { useTheme } from '@remirror/react-components';
import { defaultRemirrorTheme } from '@remirror/theme';

export interface UiThemeProviderProps {
  children: ReactNode;
}

/**
 * This the `ThemeProvider`. Wrap your editor with it to customise the theming
 * of content within your editor.
 *
 * Please be aware that this wraps your component in an extra dom layer.
 */
export const UiThemeProvider = (
  props: UiThemeProviderProps,
): ReactElement<UiThemeProviderProps> => {
  const { children } = props;
  const { theme } = useTheme();

  const muiTheme = createTheme({
    palette: {
      primary: {
        main: theme.color?.primary ?? defaultRemirrorTheme.color.primary,
        dark: theme.color?.hover?.primary ?? defaultRemirrorTheme.color.hover.primary,
        contrastText: theme.color?.primaryText ?? defaultRemirrorTheme.color.primaryText,
      },
      secondary: {
        main: theme.color?.secondary ?? defaultRemirrorTheme.color.secondary,
        dark: theme.color?.hover?.secondary ?? defaultRemirrorTheme.color.hover.secondary,
        contrastText: theme.color?.secondaryText ?? defaultRemirrorTheme.color.secondaryText,
      },
    },
  });

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
};
