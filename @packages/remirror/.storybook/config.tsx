import '@storybook/addon-console';
import React from 'react';

import { addDecorator, configure, StoryDecorator } from '@storybook/react';

const MainDecorator: StoryDecorator = story => (
  <>
    <div style={{ padding: 20 }}>{story()}</div>
  </>
);

const req = require.context('../src', true, /__stories__\/.*\.stories\.tsx$/);
function loadStories() {
  addDecorator(MainDecorator);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
