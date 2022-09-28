import 'remirror/styles/all.css';

import React from 'react';
import { CalloutExtension, wysiwygPreset } from 'remirror/extensions';
import { TableExtension } from '@remirror/extension-react-tables';
import {
  CommandSuggester,
  EditorComponent,
  FloatingToolbar,
  Remirror,
  ThemeProvider,
  ToggleHeadingMenuItem,
  ToggleCalloutMenuItem,
  useRemirror,
  WysiwygToolbar,
} from '@remirror/react';

import { mediumContent } from './sample-content/medium';

export default { title: 'Components (labs) / Toolbar' };

const extensions = () => [...wysiwygPreset(), new CalloutExtension(), new TableExtension()];

export const FixedToolbar = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: mediumContent,
    selection: 'end',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus placeholder='Enter your text'>
        <WysiwygToolbar />
        <EditorComponent />
        <FloatingToolbar />
        <CommandSuggester>
          <ToggleHeadingMenuItem commandId='heading-1' attrs={{ level: 1 }} />
          <ToggleHeadingMenuItem commandId='heading-2' attrs={{ level: 2 }} />
          <ToggleHeadingMenuItem commandId='heading-3' attrs={{ level: 3 }} />
          <ToggleHeadingMenuItem commandId='heading-4' attrs={{ level: 4 }} />
          <ToggleHeadingMenuItem commandId='heading-5' attrs={{ level: 5 }} />
          <ToggleHeadingMenuItem commandId='heading-6' attrs={{ level: 6 }} />
          <ToggleCalloutMenuItem commandId='info-callout' attrs={{ type: 'info' }} />
          <ToggleCalloutMenuItem commandId='warning-callout' attrs={{ type: 'warning' }} />
          <ToggleCalloutMenuItem commandId='success-callout' attrs={{ type: 'success' }} />
          <ToggleCalloutMenuItem commandId='error-callout' attrs={{ type: 'error' }} />
        </CommandSuggester>
      </Remirror>
    </ThemeProvider>
  );
};
