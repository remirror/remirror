import { ExampleSocialEditor, SOCIAL_SHOWCASE_CONTENT } from '@remirror/showcase/lib/social';
import React from 'react';

export default () => (
  <ExampleSocialEditor initialContent={SOCIAL_SHOWCASE_CONTENT} suppressHydrationWarning={true} />
);
