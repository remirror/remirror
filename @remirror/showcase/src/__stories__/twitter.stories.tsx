import React from 'react';

import { storiesOf } from '@storybook/react';
import { ExampleTwitterEditor, TWITTER_SHOWCASE_CONTENT } from '../twitter';

storiesOf('Twitter Editor', module).add('Basic', () => <ExampleTwitterEditor />);

storiesOf('Twitter Editor', module).add('With Content', () => (
  <ExampleTwitterEditor initialContent={TWITTER_SHOWCASE_CONTENT} />
));
