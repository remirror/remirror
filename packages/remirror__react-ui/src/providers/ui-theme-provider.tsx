import { createTheme, Theme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/system';
import React, { ReactElement, ReactNode, useMemo } from 'react';
import { useTheme } from '@remirror/react-components';
import { defaultRemirrorTheme } from '@remirror/theme';

export interface UiThemeProviderProps {
  children: ReactNode;
}

export function useRemirrorDefaultMuiTheme(): Theme {
  const { theme } = useTheme();

  return useMemo(
    () =>
      createTheme({
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
      }),
    [theme],
  );
}

/**
 * `UIThemeProvider` uses the parent app's MUI theme, or applies Remirror's default
 */
export const UiThemeProvider = (
  props: UiThemeProviderProps,
): ReactElement<UiThemeProviderProps> => {
  const { children } = props;

  const remirrorDefaultTheme = useRemirrorDefaultMuiTheme();
  const muiTheme = useMuiTheme(remirrorDefaultTheme);

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
};
