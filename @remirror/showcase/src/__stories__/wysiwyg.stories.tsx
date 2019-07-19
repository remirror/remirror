import React from 'react';

import { storiesOf } from '@storybook/react';
import { ExampleWysiwygEditor, WYSIWYG_SHOWCASE_CONTENT } from '../wysiwyg';

storiesOf('Wysiwyg Editor', module).add('Basic', () => <ExampleWysiwygEditor />);

storiesOf('Wysiwyg Editor', module).add('With Content', () => (
  <ExampleWysiwygEditor initialContent={WYSIWYG_SHOWCASE_CONTENT} />
));
