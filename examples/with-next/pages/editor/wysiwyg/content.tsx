import React, { FC } from 'react';

import { ExampleWysiwygEditor, WYSIWYG_SHOWCASE_CONTENT } from '@remirror/showcase/lib/wysiwyg';

const WysiwygEditorWithContent: FC = () => (
  <ExampleWysiwygEditor initialContent={WYSIWYG_SHOWCASE_CONTENT} suppressHydrationWarning={true} />
);
WysiwygEditorWithContent.displayName = 'WysiwygEditorWithContent';

export default WysiwygEditorWithContent;
