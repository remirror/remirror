import { ExampleWysiwygEditor, WYSIWYG_SHOWCASE_CONTENT } from '@remirror/showcase/lib/wysiwyg';
import React from 'react';

export const WysiwygEditor = () => <ExampleWysiwygEditor suppressHydrationWarning={true} />;
export const WysiwygEditorWithContent = () => (
  <ExampleWysiwygEditor
    initialContent={WYSIWYG_SHOWCASE_CONTENT}
    suppressHydrationWarning={true}
    autoFocus={false}
  />
);
