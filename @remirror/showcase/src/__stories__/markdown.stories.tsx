import { ProsemirrorDevTools } from '@remirror/dev';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { ExampleMarkdownEditor } from '../markdown';

storiesOf('Markdown Editor', module).add('Basic', () => (
  <ExampleMarkdownEditor>
    <ProsemirrorDevTools />
  </ExampleMarkdownEditor>
));

// storiesOf('Markdown Editor', module).add('With Content', () => (
//   <ExampleWysiwygEditor initialContent={WYSIWYG_SHOWCASE_CONTENT}>
//     <ProsemirrorDevTools />
//   </ExampleWysiwygEditor>
// ));
