import { ExampleWysiwygEditor, WYSIWYG_SHOWCASE_CONTENT } from '@remirror/showcase/lib/wysiwyg';
import React from 'react';

import '../home.css';

export default () => (
  <ExampleWysiwygEditor initialContent={WYSIWYG_SHOWCASE_CONTENT} suppressHydrationWarning={true} />
);
