import React, { FC } from 'react';

import { ExampleRichSocialEditor } from './rich';

const RichSocialEditor: FC = () => <ExampleRichSocialEditor suppressHydrationWarning={true} />;
RichSocialEditor.displayName = 'RichSocialEditor';

export default RichSocialEditor;
