import { ProsemirrorDevTools } from '@remirror/dev';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { ExampleWysiwygEditor, WYSIWYG_SHOWCASE_CONTENT } from '../wysiwyg';

storiesOf('Wysiwyg Editor', module)
  .add('Basic', () => (
    <ExampleWysiwygEditor>
      <ProsemirrorDevTools />
    </ExampleWysiwygEditor>
  ))
  .add('With Content', () => (
    <ExampleWysiwygEditor initialContent={WYSIWYG_SHOWCASE_CONTENT}>
      <ProsemirrorDevTools />
    </ExampleWysiwygEditor>
  ));
