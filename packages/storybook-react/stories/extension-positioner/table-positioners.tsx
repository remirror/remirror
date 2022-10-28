import 'remirror/styles/all.css';
import './styles.css';

import { css } from '@emotion/css';
import { Placement } from '@popperjs/core';
import { Annotations, BaseStory } from '@storybook/addons';
import React, { ReactElement, useEffect } from 'react';
import type { Positioner } from 'remirror/extensions';
import {
  activeCellColumnPositioner,
  activeCellPositioner,
  activeCellRowPositioner,
  allCellSelectionPositioner,
  allColumnsStartPositioner,
  allRowsStartPositioner,
  cellColumnSelectionPositioner,
  cellRowSelectionPositioner,
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
  content: ReactElement;
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

const Template: Story = ({
  content,
  positioner,
  placement,
  label,
  multi = false,
}: TemplateArgs) => {
  const { manager, state, onChange } = useRemirror({
    stringHandler: 'html',
    content: TABLE_HTML,
    extensions: () => [new TableExtension()],
  });

  const Component = multi ? MultiPositionerIllustration : PositionerIllustration;
  const floatingPositioner = multi ? activeCellPositioner : positioner;

  return (
    <ThemeProvider>
      {content}
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
  content: <p>Creates a rect which wraps the current table.</p>,
  label: 'The bounds of the table',
};

export const ActiveCell: Story = Template.bind({});
ActiveCell.args = {
  positioner: activeCellPositioner,
  placement: 'bottom',
  content: <p>Creates a rect for the active table cell.</p>,
  label: 'The active cell',
};

export const ActiveCellColumn: Story = Template.bind({});
ActiveCellColumn.args = {
  positioner: activeCellColumnPositioner,
  placement: 'right',
  content: <p>Creates a rect for the column of the active cell.</p>,
  label: 'The active column',
};

export const ActiveCellRow: Story = Template.bind({});
ActiveCellRow.args = {
  positioner: activeCellRowPositioner,
  placement: 'bottom',
  content: <p>Creates a rect for the row of the active cell.</p>,
  label: 'The active row',
};

export const SelectedColumn: Story = Template.bind({});
SelectedColumn.args = {
  positioner: selectedColumnPositioner,
  placement: 'right',
  content: (
    <p>
      Creates a rect for a <em>single</em> column cell selection which goes all the way from the top
      to the bottom of the table.
    </p>
  ),
  label: 'A single column selected',
};

export const SelectedRow: Story = Template.bind({});
SelectedRow.args = {
  positioner: selectedRowPositioner,
  placement: 'bottom',
  content: (
    <p>
      Creates a rect for a <em>single</em> row cell selection which goes all the way from the left
      to the right of the table.
    </p>
  ),
  label: 'A single row selected',
};

export const AllColumnsStart: Story = Template.bind({});
AllColumnsStart.args = {
  positioner: allColumnsStartPositioner,
  placement: 'bottom',
  content: <p>Creates multiple rects for the top side of each column in a table.</p>,
  label: 'Alternating colours for each rect',
  multi: true,
};

export const AllRowsStart: Story = Template.bind({});
AllRowsStart.args = {
  positioner: allRowsStartPositioner,
  placement: 'right',
  content: <p>Creates multiple rects for the left side of each row in a table.</p>,
  label: 'Alternating colours for each rect',
  multi: true,
};

export const CellSelection: Story = Template.bind({});
CellSelection.args = {
  positioner: cellSelectionPositioner,
  placement: 'bottom',
  content: <p>Creates a rect which wraps the selected cells.</p>,
  label: 'A cell selection',
};

export const CellColumnSelection: Story = Template.bind({});
CellColumnSelection.args = {
  positioner: cellColumnSelectionPositioner,
  placement: 'right',
  content: (
    <p>
      Creates a rect for when the cell selection goes all the way from the top to the bottom of the
      table.
    </p>
  ),
  label: 'A column selection',
};

export const CellRowSelection: Story = Template.bind({});
CellRowSelection.args = {
  positioner: cellRowSelectionPositioner,
  placement: 'bottom',
  content: (
    <p>
      Creates a rect for when the cell selection goes all the way from the left to the right of the
      table.
    </p>
  ),
  label: 'A row selection',
};

export const AllCellSelection: Story = Template.bind({});
AllCellSelection.args = {
  positioner: allCellSelectionPositioner,
  placement: 'bottom',
  content: <p>Creates a rect for when all cells in a table are selected.</p>,
  label: 'All cells selected',
};

export default Table;
