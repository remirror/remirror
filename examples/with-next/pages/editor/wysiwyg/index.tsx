import React, { FC } from 'react';

import { ExampleWysiwygEditor } from '@remirror/showcase/lib/wysiwyg';

const WysiwygEditor: FC = () => <ExampleWysiwygEditor suppressHydrationWarning={true} />;
WysiwygEditor.displayName = 'WysiwygEditor';

export default WysiwygEditor;
