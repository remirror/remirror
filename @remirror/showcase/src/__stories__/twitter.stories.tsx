import React from 'react';

import { storiesOf } from '@storybook/react';
import { ShowcaseTwitterEditor, TWITTER_SHOWCASE_CONTENT } from '../twitter';

storiesOf('Twitter Editor', module).add('Basic', () => <ShowcaseTwitterEditor />);

storiesOf('Twitter Editor', module).add('With Content', () => (
  <ShowcaseTwitterEditor initialContent={TWITTER_SHOWCASE_CONTENT} />
));
