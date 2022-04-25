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

export interface WysiwygEditorProps {
  placeholder?: string;
}

export const WysiwygEditor: FC<PropsWithChildren<WysiwygEditorProps>> = ({
  placeholder,
  ...props
}) => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder }), new TableExtension(), ...wysiwygPreset()],
    [placeholder],
  );

  const { children } = props;
  const { manager } = useRemirror({ extensions });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <Remirror manager={manager}>
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
