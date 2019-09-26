import { ExampleSocialEditor, SOCIAL_SHOWCASE_CONTENT } from '@remirror/showcase/lib/social';
import React, { FC } from 'react';

const SocialEditorWithContent: FC = () => (
  <ExampleSocialEditor initialContent={SOCIAL_SHOWCASE_CONTENT} suppressHydrationWarning={true} />
);
SocialEditorWithContent.displayName = 'SocialEditorWithContent';

export default SocialEditorWithContent;
