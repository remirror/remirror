import { addDecorator, configure } from '@storybook/react';
import { ThemeDecorator } from './decorators';

// automatically import all files ending in *.stories.tsx
const showcase = require.context('../../@remirror/showcase', true, /__stories__\/.*.stories.tsx$/);
const ui = require.context('../../@remirror/ui', true, /__stories__\/.*.stories.tsx$/);
const uiIcons = require.context('../../@remirror/ui-icons', true, /__stories__\/.*.stories.tsx$/);
const uiButtons = require.context('../../@remirror/ui-buttons', true, /__stories__\/.*.stories.tsx$/);

const loadStories = () => {
  showcase.keys().forEach(showcase);
  ui.keys().forEach(ui);
  uiIcons.keys().forEach(uiIcons);
  uiButtons.keys().forEach(uiButtons);
};

configure(loadStories, module);

[ThemeDecorator].forEach(addDecorator);
