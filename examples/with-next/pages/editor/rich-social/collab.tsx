import React, { FC } from 'react';

import { ExampleRichSocialEditor } from './rich';

const RichSocialEditorWithCollab: FC = () => (
  <ExampleRichSocialEditor suppressHydrationWarning={true} collaboration={true} />
);
RichSocialEditorWithCollab.displayName = 'RichSocialEditorWithCollab';

export default RichSocialEditorWithCollab;
