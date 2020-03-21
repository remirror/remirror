import React, { FC } from 'react';

import { ExampleRichSocialEditor, RICH_SOCIAL_SHOWCASE_CONTENT } from './rich';

const RichSocialEditorWithContent: FC = () => (
  <ExampleRichSocialEditor
    initialContent={RICH_SOCIAL_SHOWCASE_CONTENT}
    suppressHydrationWarning={true}
  />
);
RichSocialEditorWithContent.displayName = 'RichSocialEditorWithContent';

export default RichSocialEditorWithContent;
