import type { Story } from '@storybook/react';

import BasicComponent from './basic';
import ResizableComponent from './resizable';
import ResizableWithMinMaxWidthComponent from './resizable-with-min-max-width';
import WithFigcaption from './with-figcaption';

const Basic: Story = BasicComponent.bind({});
Basic.storyName = 'Basic';

const Resizable: Story = ResizableComponent.bind({});
Resizable.storyName = 'Resizable';

const ResizableWithMinMaxWidth: Story = ResizableWithMinMaxWidthComponent.bind({});
ResizableWithMinMaxWidth.storyName = 'ResizableWithMinMaxWidth';

export { Basic, Resizable, ResizableWithMinMaxWidth, WithFigcaption };

export default { title: 'Extensions / Image' };
