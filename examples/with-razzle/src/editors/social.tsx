import React from 'react';

import { ExampleSocialEditor, SOCIAL_SHOWCASE_CONTENT } from '@remirror/showcase/lib/social';

export const SocialEditor = () => <ExampleSocialEditor suppressHydrationWarning={true} />;
export const SocialEditorWithContent = () => (
  <ExampleSocialEditor suppressHydrationWarning={true} initialContent={SOCIAL_SHOWCASE_CONTENT} />
);
