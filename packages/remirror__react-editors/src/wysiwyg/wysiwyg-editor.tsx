import { FC, useCallback } from 'react';
import { PlaceholderExtension, wysiwygPreset } from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';

import { BubbleMenu } from '../components/bubble-menu';
import { TopToolbar } from '../components/top-toolbar';

export interface WysiwygEditorProps {
  placeholder?: string;
}

export const WysiwygEditor: FC<WysiwygEditorProps> = ({ placeholder, ...props }) => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder }), ...wysiwygPreset()],
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
          {children}
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};
