import { ExampleTwitterEditor, TWITTER_SHOWCASE_CONTENT } from '@remirror/showcase/lib/twitter';
import React from 'react';

export const TwitterEditor = () => <ExampleTwitterEditor suppressHydrationWarning={true} />;
export const TwitterEditorWithContent = () => (
  <ExampleTwitterEditor suppressHydrationWarning={true} initialContent={TWITTER_SHOWCASE_CONTENT} />
);
