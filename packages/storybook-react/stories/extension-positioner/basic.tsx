import 'remirror/styles/all.css';
import './styles.css';

import { css } from '@emotion/css';
import { Placement } from '@popperjs/core';
import { StoryFn } from '@storybook/react';
import React, { useEffect } from 'react';
import type { StringPositioner } from 'remirror/extensions';
import {
  FloatingWrapper,
  PositionerPortal,
  Remirror,
  ThemeProvider,
  useCommands,
  usePositioner,
  useRemirror,
} from '@remirror/react';

interface PositionerIllustrationProps {
  positioner: StringPositioner;
}

const PositionerIllustration = ({ positioner }: PositionerIllustrationProps) => {
  const { ref, x, y, width, height, active } = usePositioner(positioner);
  const { forceUpdatePositioners } = useCommands();

  useEffect(() => {
    forceUpdatePositioners();
  }, [forceUpdatePositioners]);

  if (!active) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={css`
        border: 1px solid var(--rmr-hue-red-9);
        position: absolute;
        pointer-events: none;
      `}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      &nbsp;
    </div>
  );
};

interface TemplateArgs {
  content: string;
  positioner: StringPositioner;
  placement: Placement;
  label: string;
}

type Story = StoryFn<TemplateArgs>;

const Template: Story = ({ content, positioner, placement, label }: TemplateArgs) => {
  const { manager, state, onChange } = useRemirror({
    stringHandler: 'html',
    content,
  });

  return (
    <ThemeProvider>
      <p>
        <strong className={css('color: var(--rmr-hue-red-9);')}>☐</strong> outline demonstrates the
        bounds of the positioner, and is shown for illustrative purposes only.
      </p>
      <Remirror manager={manager} initialContent={state} onChange={onChange} autoRender>
        <>
          <FloatingWrapper positioner={positioner} placement={placement}>
            <div className='card'>{label}</div>
          </FloatingWrapper>
          <PositionerPortal>
            <PositionerIllustration positioner={positioner} />
          </PositionerPortal>
        </>
      </Remirror>
    </ThemeProvider>
  );
};

export const Selection: Story = Template.bind({});
Selection.args = {
  content: '<p>Creates a rect which wraps the current selection.</p>',
  positioner: 'selection',
  placement: 'bottom',
  label: 'Anchored to the range text selection',
};

export const Cursor: Story = Template.bind({});
Cursor.args = {
  content: '<p>Creates a rect for the cursor. Is inactive for empty selections.</p>',
  positioner: 'cursor',
  placement: 'bottom',
  label: 'Anchored to the empty selection (cursor)',
};

export const Always: Story = Template.bind({});
Always.args = {
  content:
    '<p>Creates a positioner which always shows the position of the selection whether empty or not.</p>',
  positioner: 'always',
  placement: 'bottom',
  label: 'Anchored to the both range and empty selections',
};

export const Block: Story = Template.bind({});
Block.args = {
  content: '<p>Creates a rect which wraps the entire selected block node.</p>',
  positioner: 'block',
  placement: 'bottom',
  label: 'Takes the width of the current block node, placement prop can be changed',
};

export const EmptyBlock: Story = Template.bind({});
EmptyBlock.args = {
  content:
    '<p>Creates a rect which wraps the entire selected block node, but only when it is empty.</p>',
  positioner: 'emptyBlock',
  placement: 'bottom',
  label: 'Takes the width of the current EMPTY block node, placement prop can be changed',
};

export const EmptyBlockStart: Story = Template.bind({});
EmptyBlockStart.args = {
  content: '<p>Creates a rect which indicates the <em>start</em> of an empty block node.</p>',
  positioner: 'emptyBlockStart',
  placement: 'right',
  label: 'Positioned at the start of an EMPTY block node',
};

export const EmptyBlockEnd: Story = Template.bind({});
EmptyBlockEnd.args = {
  content: '<p>Creates a rect which indicates the <em>end</em> of an empty block node.</p>',
  positioner: 'emptyBlockEnd',
  placement: 'left',
  label: 'Positioned at the end of an EMPTY block node',
};

export default Cursor;
