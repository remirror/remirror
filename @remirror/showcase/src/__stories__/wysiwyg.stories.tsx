import React from 'react';

import { storiesOf } from '@storybook/react';
import { ExampleWysiwygEditor, WYSIWYG_SHOWCASE_CONTENT } from '../wysiwyg';

storiesOf('Wysiwyg', module).add('Basic', () => (
  <ExampleWysiwygEditor initialContent={WYSIWYG_SHOWCASE_CONTENT} />
));
