import type { Story } from '@storybook/react';

import BasicComponent from './basic';
import ResizableCompoment from './resizable';

const Basic: Story<{ delaySeconds: number }> = BasicComponent.bind({});
Basic.args = {
  delaySeconds: 1,
};
Basic.storyName = 'Basic';

const Resizable: Story<{ delaySeconds: number }> = ResizableCompoment.bind({});
Resizable.args = {
  delaySeconds: 1,
};
Resizable.storyName = 'Resizable';

export { Basic, Resizable };

export default { title: 'Extensions / Image' };
