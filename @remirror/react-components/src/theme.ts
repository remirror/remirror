import { ThemeContext } from '@emotion/core';
import DefaultStyled, { CreateStyled } from '@emotion/styled';
import { Cast } from '@remirror/core';
import { Context, useContext } from 'react';

export const styled = Cast<CreateStyled<RemirrorTheme>>(DefaultStyled);
export type RemirrorTheme = typeof remirrorTheme;

export const remirrorTheme = {
  colors: {
    primary: '#1DA1F2',
    warn: '#FFAD1F',
    error: '#E0245E',
    border: '#99CFEB',
    plain: '#657786',
    primaryBackground: '#E8F5FD',
    icon: '#aab8c2',
  },
  font: {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    size: '1em',
    weight: '400',
  },
};

/**
 * Provides access to the theme context
 */
export const RemirrorThemeContext = ThemeContext as Context<RemirrorTheme>;

/**
 * Hook which returns the current theme from the context
 */
export const useTheme = () => useContext(RemirrorThemeContext);
