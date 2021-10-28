import { HeadingExtension, TableExtension, TextColorExtension } from 'remirror/extensions';
import {
  EditorComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

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
      <p>navigator.platform:{navigator?.platform} </p>
      <p>navigator.userAgentData.platform:{(navigator as any)?.userAgentData.platform} </p>

      <p>commands:</p>
      <p
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyItems: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.createTable()}
        >
          create a table with the default options
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commands.createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: false })
          }
        >
          create a 4*4 table without headers
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            commands.createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: true })
          }
        >
          create a 4*4 table with headers
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.createTable({ cellContent: customCellContent })}
        >
          create a table with custom cell content
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.deleteTableColumn()}
        >
          delete the current column
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.deleteTableRow()}
        >
          delete the current row
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.addTableColumnAfter()}
        >
          add a column after the current one
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.addTableRowBefore()}
        >
          add a row before the current one
        </button>

        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => commands.deleteTable()}
        >
          delete the table
        </button>
      </p>
    </div>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
        <CommandMenu />
      </Remirror>
    </ThemeProvider>
  );
};

const extensions = () => [new TableExtension(), new HeadingExtension(), new TextColorExtension()];

export default Basic;
