import { HeadingExtension } from '@remirror/extension-heading';
import { TableExtension } from '@remirror/extension-tables';
import { TextColorExtension } from '@remirror/extension-text-color';
import { Remirror, ThemeProvider, useRemirror, useRemirrorContext } from '@remirror/react';

export default { title: 'Tables extension' };

const CommandMenu = () => {
  const ctx = useRemirrorContext();
  const schema = ctx.schema;
  const customCellContent = schema.nodes.heading.create({ level: 3 }, [
    schema.text('hello', [schema.marks.textColor.create({ color: '#ffc0cb' })]),
    schema.text('world', [schema.marks.textColor.create({ color: '#87cefa' })]),
  ]);
  const commands = ctx.commands;

  return (
    <div>
      <p>commands:</p>
      <p
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyItems: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <button onClick={() => commands.createTable()}>
          create a table with the default options
        </button>

        <button
          onClick={() =>
            commands.createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: false })
          }
        >
          create a 4*4 table without headers
        </button>

        <button
          onClick={() =>
            commands.createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: true })
          }
        >
          create a 4*4 table with headers
        </button>

        <button onClick={() => commands.createTable({ cellContent: customCellContent })}>
          create a table with custom cell content
        </button>

        <button onClick={() => commands.deleteTableColumn()}>delete the current column</button>

        <button onClick={() => commands.deleteTableRow()}>delete the current row</button>

        <button onClick={() => commands.addTableColumnAfter()}>
          add a column after the current column
        </button>

        <button onClick={() => commands.addTableRowBefore()}>
          add a column before the current row
        </button>

        <button onClick={() => commands.deleteTable()}>delete the table</button>
      </p>
    </div>
  );
};

const InnerEditor = () => {
  const { getRootProps } = useRemirrorContext();

  return (
    <div>
      <div {...getRootProps()} />
      <CommandMenu />
    </div>
  );
};

export const Table = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <InnerEditor />
      </Remirror>
    </ThemeProvider>
  );
};

Table.args = {
  autoLink: true,
  openLinkOnClick: true,
};

const extensions = () => [new TableExtension(), new HeadingExtension(), new TextColorExtension()];

const content = '';
