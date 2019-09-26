import { ExampleWysiwygEditor } from '@remirror/showcase/lib/wysiwyg';
import React, { FC } from 'react';

const WysiwygEditor: FC = () => <ExampleWysiwygEditor suppressHydrationWarning={true} />;
WysiwygEditor.displayName = 'WysiwygEditor';

export default WysiwygEditor;
