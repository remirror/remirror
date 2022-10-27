import 'remirror/styles/all.css';
import './styles.css';

import { css } from '@emotion/css';
import { Placement } from '@popperjs/core';
import { Annotations, BaseStory } from '@storybook/addons';
import React, { useEffect } from 'react';
import type { Positioner } from 'remirror/extensions';
import {
  activeCellColumnPositioner,
  activeCellPositioner,
  activeCellRowPositioner,
  allColumnsStartPositioner,
  allRowsStartPositioner,
  cellSelectionPositioner,
  selectedColumnPositioner,
  selectedRowPositioner,
  TableExtension,
  tablePositioner,
} from 'remirror/extensions';
import {
  FloatingWrapper,
  PositionerPortal,
  Remirror,
  ThemeProvider,
  useCommands,
  useMultiPositioner,
  usePositioner,
  useRemirror,
} from '@remirror/react';

type Story = BaseStory<TemplateArgs, JSX.Element> & Annotations<TemplateArgs, JSX.Element>;

interface PositionerIllustrationProps {
  positioner: Positioner;
}

const PositionerIllustration = ({ positioner }: PositionerIllustrationProps) => {
  const { ref, x, y, width, height, active } = usePositioner(positioner, []);
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

const MultiPositionerIllustration = ({ positioner }: PositionerIllustrationProps) => {
  const positioners = useMultiPositioner(positioner, []);
  const { forceUpdatePositioners } = useCommands();

  useEffect(() => {
    forceUpdatePositioners();
  }, [forceUpdatePositioners]);

  return (
    <>
      {positioners.map(({ key, ref, x, y, width, height }, i) => (
        <div
          key={key}
          ref={ref}
          className={css`
            border: 1px solid var(${i % 2 === 0 ? '--rmr-hue-red-9' : '--rmr-hue-blue-9'});
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
      ))}
    </>
  );
};

interface TemplateArgs {
  positioner: Positioner;
  placement: Placement;
  label: string;
  multi?: boolean;
}

const TABLE_HTML = `
  <table>
    <tr><td /><td /><td /></tr>
    <tr><td /><td /><td /></tr>
    <tr><td /><td /><td /></tr>
  </table>
`;

const Template: Story = ({ positioner, placement, label, multi = false }: TemplateArgs) => {
  const { manager, state, onChange } = useRemirror({
    stringHandler: 'html',
    content: TABLE_HTML,
    extensions: () => [new TableExtension()],
  });

  const Component = multi ? MultiPositionerIllustration : PositionerIllustration;
  const floatingPositioner = multi ? activeCellPositioner : positioner;

  return (
    <ThemeProvider>
      <p>
        <strong className={css('color: var(--rmr-hue-red-9);')}>☐</strong> outline demonstrates the
        bounds of the positioner, and is shown for illustrative purposes only.
      </p>
      <Remirror manager={manager} initialContent={state} onChange={onChange} autoRender>
        <>
          <FloatingWrapper positioner={floatingPositioner} placement={placement}>
            <div className='card'>{label}</div>
          </FloatingWrapper>
          <PositionerPortal>
            <Component positioner={positioner} />
          </PositionerPortal>
        </>
      </Remirror>
    </ThemeProvider>
  );
};

export const Table = Template.bind({});
Table.args = {
  positioner: tablePositioner,
  placement: 'bottom',
  label: 'Creates a rect which wraps the current table.',
};

export const ActiveCell: Story = Template.bind({});
ActiveCell.args = {
  positioner: activeCellPositioner,
  placement: 'bottom',
  label: 'Creates a rect for the active table cell.',
};

export const ActiveCellColumn: Story = Template.bind({});
ActiveCellColumn.args = {
  positioner: activeCellColumnPositioner,
  placement: 'right',
  label: 'Creates a rect for the column of the active cell.',
};

export const ActiveCellRow: Story = Template.bind({});
ActiveCellRow.args = {
  positioner: activeCellRowPositioner,
  placement: 'bottom',
  label: 'Creates a rect for the row of the active cell.',
};

export const SelectedColumn: Story = Template.bind({});
SelectedColumn.args = {
  positioner: selectedColumnPositioner,
  placement: 'right',
  label: 'Creates a rect for a single column where all rows are selected.',
};

export const SelectedRow: Story = Template.bind({});
SelectedRow.args = {
  positioner: selectedRowPositioner,
  placement: 'bottom',
  label: 'Creates a rect for a single row where all columns are selected.',
};

export const AllColumnsStart: Story = Template.bind({});
AllColumnsStart.args = {
  positioner: allColumnsStartPositioner,
  placement: 'bottom',
  label: 'Creates multiple rects for the top side of each column in a table.',
  multi: true,
};

export const AllRowsStart: Story = Template.bind({});
AllRowsStart.args = {
  positioner: allRowsStartPositioner,
  placement: 'right',
  label: 'Creates multiple rects for the left side of each row in a table.',
  multi: true,
};

export const CellSelection: Story = Template.bind({});
CellSelection.args = {
  positioner: cellSelectionPositioner,
  placement: 'bottom',
  label: 'Creates a rect which wraps the selected cells.',
};

export default Table;
