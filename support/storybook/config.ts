import { configure } from '@storybook/react';

// automatically import all files ending in *.stories.tsx
const req = require.context('../../docs', true, /__stories__\/[a-z-.]+.stories.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
