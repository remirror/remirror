import { ShowcaseTwitterEditor, TWITTER_SHOWCASE_CONTENT } from '@remirror/showcase/lib/twitter';
import React from 'react';

export const TwitterEditor = () => <ShowcaseTwitterEditor suppressHydrationWarning={true} />;
export const TwitterEditorWithContent = () => (
  <ShowcaseTwitterEditor suppressHydrationWarning={true} initialContent={TWITTER_SHOWCASE_CONTENT} />
);
