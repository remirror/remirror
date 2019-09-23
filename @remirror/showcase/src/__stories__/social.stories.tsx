import { storiesOf } from '@storybook/react';
import React from 'react';
import { ExampleSocialEditor, SOCIAL_SHOWCASE_CONTENT } from '../social';

storiesOf('Social Editor', module).add('Basic', () => <ExampleSocialEditor />);

storiesOf('Social Editor', module).add('With Content', () => (
  <ExampleSocialEditor initialContent={SOCIAL_SHOWCASE_CONTENT} />
));
