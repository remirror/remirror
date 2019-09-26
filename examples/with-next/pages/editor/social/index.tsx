import { ExampleSocialEditor } from '@remirror/showcase/lib/social';
import React, { FC } from 'react';

const SocialEditor: FC = () => <ExampleSocialEditor suppressHydrationWarning={true} />;
SocialEditor.displayName = 'SocialEditor';

export default SocialEditor;
