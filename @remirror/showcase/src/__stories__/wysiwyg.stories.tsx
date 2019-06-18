import React from 'react';

import { storiesOf } from '@storybook/react';
import { ExampleWysiwygEditor, initialContent } from '../wysiwyg';

storiesOf('Wysiwyg', module).add('Basic', () => <ExampleWysiwygEditor initialContent={initialContent} />);
