import React, { FC, PropsWithChildren, useCallback } from 'react';
import { PlaceholderExtension, wysiwygPreset } from 'remirror/extensions';
import { TableExtension } from '@remirror/extension-react-tables';
import { i18nFormat } from '@remirror/i18n';
import {
  EditorComponent,
  Remirror,
  TableComponents,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

import { BubbleMenu } from '../components/bubble-menu';
import { TopToolbar } from '../components/top-toolbar';
import { ReactEditorProps } from '../types';

export interface WysiwygEditorProps extends Partial<ReactEditorProps> {}

export const WysiwygEditor: FC<PropsWithChildren<WysiwygEditorProps>> = ({
  placeholder,
  stringHandler,
  children,
  theme,
  ...rest
}) => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder }), new TableExtension(), ...wysiwygPreset()],
    [placeholder],
  );

  const { manager } = useRemirror({ extensions, stringHandler });

  return (
    <AllStyledComponent>
      <ThemeProvider theme={theme}>
        <Remirror manager={manager} i18nFormat={i18nFormat} {...rest}>
          <TopToolbar />
          <EditorComponent />
          <BubbleMenu />
          <TableComponents />
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};
