import { baseTheme, RemirrorThemeProvider, RemirrorThemeRoot, useRemirrorTheme } from '@remirror/ui';
import { DecoratorFunction } from '@storybook/addons';
import React, { FC, ReactElement } from 'react';

export const ThemeDecorator: DecoratorFunction<ReactElement> = storyFn => (
  <RemirrorThemeProvider theme={baseTheme}>
    <RemirrorThemeRoot>
      <ThemedDiv>{storyFn()}</ThemedDiv>
    </RemirrorThemeRoot>
  </RemirrorThemeProvider>
);

const ThemedDiv: FC = ({ children }) => {
  const { sx } = useRemirrorTheme();
  return <div css={sx({ padding: 3 })}>{children}</div>;
};
