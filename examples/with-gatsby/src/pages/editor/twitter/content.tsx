import { ExampleTwitterEditor, TWITTER_SHOWCASE_CONTENT } from '@remirror/showcase/lib/twitter';
import React from 'react';

export default () => (
  <ExampleTwitterEditor initialContent={TWITTER_SHOWCASE_CONTENT} suppressHydrationWarning={true} />
);
