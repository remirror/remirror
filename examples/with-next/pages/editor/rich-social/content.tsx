import { ExampleRichSocialEditor, RICH_SOCIAL_SHOWCASE_CONTENT } from '@remirror/showcase/lib/rich-social';
import React, { FC } from 'react';

const RichSocialEditorWithContent: FC = () => (
  <ExampleRichSocialEditor initialContent={RICH_SOCIAL_SHOWCASE_CONTENT} suppressHydrationWarning={true} />
);
RichSocialEditorWithContent.displayName = 'SocialEditorWithContent';

export default RichSocialEditorWithContent;
