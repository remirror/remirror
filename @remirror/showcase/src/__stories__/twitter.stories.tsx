import { ProsemirrorDevTools } from '@remirror/dev';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { ExampleTwitterEditor, TWITTER_SHOWCASE_CONTENT } from '../twitter';
//
storiesOf('Twitter Editor', module).add('Basic', () => (
  <ExampleTwitterEditor>
    <ProsemirrorDevTools />
  </ExampleTwitterEditor>
));

storiesOf('Twitter Editor', module).add('With Content', () => (
  <ExampleTwitterEditor initialContent={TWITTER_SHOWCASE_CONTENT}>
    <ProsemirrorDevTools />
  </ExampleTwitterEditor>
));
