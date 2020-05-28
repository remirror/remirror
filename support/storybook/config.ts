import { configure } from '@storybook/react';

const all = require.context('../../@remirror', true, /__stories__\/.*.stories.tsx$/);

const loadStories = () => {
  all.keys().forEach(all);
};

configure(loadStories, module);
