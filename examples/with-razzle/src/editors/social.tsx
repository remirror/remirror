import { ExampleSocialEditor, SOCIAL_SHOWCASE_CONTENT } from '@remirror/showcase/lib/social';
import React from 'react';

export const SocialEditor = () => <ExampleSocialEditor suppressHydrationWarning={true} />;
export const SocialEditorWithContent = () => (
  <ExampleSocialEditor suppressHydrationWarning={true} initialContent={SOCIAL_SHOWCASE_CONTENT} />
);
