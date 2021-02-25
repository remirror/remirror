import { HeadingExtension } from '@remirror/extension-heading';
import { TableExtension } from '@remirror/extension-tables';
import { TextColorExtension } from '@remirror/extension-text-color';
import { Remirror, ThemeProvider, useRemirror, useRemirrorContext } from '@remirror/react';

export default { title: 'Tables extension' };

const Menu = () => {
  const ctx = useRemirrorContext();
  const schema = ctx.schema;
  const customCellContent = schema.nodes.heading.create({ level: 3 }, [
    schema.text('hello', [schema.marks.textColor.create({ color: '#ffc0cb' })]),
    schema.text('world', [schema.marks.textColor.create({ color: '#87cefa' })]),
  ]);
  const createTable = ctx.commands.createTable;

  return (
    <div>
      <button onClick={() => createTable()}>insert a table with the default options</button>
      <button onClick={() => createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: false })}>
        insert a 4*4 table without headers
      </button>
      <button onClick={() => createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: true })}>
        insert a 4*4 table with headers
      </button>
      <button onClick={() => createTable({ cellContent: customCellContent })}>
        insert a table with custom cell content
      </button>
    </div>
  );
};

const InnerEditor = () => {
  const { getRootProps } = useRemirrorContext();

  return (
    <div>
      <Menu />
      <div {...getRootProps()} />
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
