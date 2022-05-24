import { FC, PropsWithChildren, useCallback } from 'react';
import { PlaceholderExtension, wysiwygPreset } from 'remirror/extensions';
import { TableExtension } from '@remirror/extension-react-tables';
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
  ...rest
}) => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder }), new TableExtension(), ...wysiwygPreset()],
    [placeholder],
  );

  const { manager } = useRemirror({ extensions, stringHandler });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager} {...rest}>
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
