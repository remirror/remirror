import React from 'react';

import { storiesOf } from '@storybook/react';
import { ExampleWysiwygUI, initialContent } from '../wysiwyg';

storiesOf('Wysiwyg', module).add('Basic', () => <ExampleWysiwygUI initialContent={initialContent} />);
