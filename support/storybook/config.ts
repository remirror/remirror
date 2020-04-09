import { addDecorator, configure } from '@storybook/react';

import { ThemeDecorator } from './decorators';

const all = require.context('../../@remirror/playground', true, /__stories__\/.*.stories.tsx$/);

const loadStories = () => {
  all.keys().forEach(all);
};

configure(loadStories, module);

[ThemeDecorator].forEach(addDecorator);
