import { ReactElement } from 'react';
import { Annotations, BaseStory } from '@storybook/addons';
import { Placement } from '@popperjs/core';
import { FloatingWrapper, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import type { PositionerParam } from 'remirror/extensions';

import 'remirror/styles/all.css';
import './styles.css';

type Story = BaseStory<TemplateArgs, JSX.Element> & Annotations<TemplateArgs, JSX.Element>;

const Positioners: React.FC<{
  positioner: PositionerParam;
  label: string;
  placement: Placement;
}> = ({ positioner, label, placement }) => {
  return (
    <FloatingWrapper positioner={positioner} placement={placement}>
      <div className='card'>{label}</div>
    </FloatingWrapper>
  );
};

interface TemplateArgs {
  children: ReactElement;
  positioner: PositionerParam;
}
const Template: Story = ({ children, positioner }: TemplateArgs) => {
  const { manager, state, onChange } = useRemirror();

  const placements: Map<string, Placement> = new Map([
    ['Left', 'left'],
    ['Right', 'right'],
    ['Top', 'top'],
    ['Bottom', 'bottom'],
  ]);

  return (
    <ThemeProvider>
      {children}
      <Remirror manager={manager} initialContent={state} onChange={onChange} autoRender>
        <>
          {Array.from(placements.entries()).map(([label, placement]) => (
            <Positioners positioner={positioner} label={label} placement={placement} />
          ))}
        </>
      </Remirror>
    </ThemeProvider>
  );
};

export const Selection = Template.bind({});
Selection.args = {
  children: <p>Creates a rect which wraps the current selection</p>,
  positioner: 'selection',
};

export const Cursor: Story = Template.bind({});
Cursor.args = {
  children: <p>Creates a rect for the cursor. Is inactive for empty selections</p>,
  positioner: 'cursor',
};

export const Always: Story = Template.bind({});
Always.args = {
  children: (
    <p>
      Creates a positioner which always shows the position of the selection whether empty or not.
    </p>
  ),
  positioner: 'always',
};

export const Block: Story = Template.bind({});
Block.args = {
  children: <p>Creates a position which wraps the entire selected block node.</p>,
  positioner: 'block',
};

export const EmptyBlock: Story = Template.bind({});
EmptyBlock.args = {
  children: (
    <p>
      Creates a position which wraps the entire selected block node. This is only active when the
      block node is empty.
    </p>
  ),
  positioner: 'emptyBlock',
};

export const EmptyBlockStart: Story = Template.bind({});
EmptyBlockStart.args = {
  children: (
    <p>
      Creates a position which wraps the <em>start</em> of the selected block node. This is only
      active when the block node is empty.
    </p>
  ),
  positioner: 'emptyBlockStart',
};

export const EmptyBlockEnd: Story = Template.bind({});
EmptyBlockEnd.args = {
  children: (
    <p>
      Creates a position which wraps the <em>end</em> of the selected block node. This is only
      active when the block node is empty.
    </p>
  ),
  positioner: 'emptyBlockEnd',
};
