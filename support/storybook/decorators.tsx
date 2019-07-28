import { baseTheme, RemirrorThemeProvider } from '@remirror/ui';
import { StoryDecorator } from '@storybook/react';
import React from 'react';

export const ThemeDecorator: StoryDecorator = storyFn => (
  <RemirrorThemeProvider theme={baseTheme}>
    <>{storyFn()}</>
  </RemirrorThemeProvider>
);
