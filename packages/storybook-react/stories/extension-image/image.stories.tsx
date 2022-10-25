import type { Story } from '@storybook/react';

import BasicComponent from './basic';
import ResizableComponent from './resizable';
import WithFigcaption from './with-figcaption';

const Basic: Story = BasicComponent.bind({});
Basic.storyName = 'Basic';

const Resizable: Story = ResizableComponent.bind({});
Resizable.storyName = 'Resizable';

export { Basic, Resizable, WithFigcaption };

export default { title: 'Extensions / Image' };
