import { ExampleRichSocialEditor } from '@remirror/showcase/lib/rich-social';
import React, { FC } from 'react';

const RichSocialEditor: FC = () => <ExampleRichSocialEditor suppressHydrationWarning={true} />;
RichSocialEditor.displayName = 'SocialEditor';

export default RichSocialEditor;
