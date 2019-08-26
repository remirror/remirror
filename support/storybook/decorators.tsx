import { baseTheme, RemirrorThemeProvider, useRemirrorTheme } from '@remirror/ui';
import { StoryDecorator } from '@storybook/react';
import React, { FC } from 'react';

export const ThemeDecorator: StoryDecorator = storyFn => (
  <RemirrorThemeProvider theme={baseTheme}>
    <ThemedDiv>{storyFn()}</ThemedDiv>
  </RemirrorThemeProvider>
);

const ThemedDiv: FC = ({ children }) => {
  const { sx } = useRemirrorTheme();
  return <div css={sx({ padding: 3 })}>{children}</div>;
};
