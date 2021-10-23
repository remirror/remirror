import { useEffect, useState } from 'react';
import type { AnyExtension } from 'remirror';
import { YjsExtension } from 'remirror/extensions';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { TableExtension } from '@remirror/extension-react-tables';
import {
  EditorComponent,
  ReactComponentExtension,
  Remirror,
  TableComponents,
  tableControllerPluginKey,
  ThemeProvider,
  useCommands,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const CommandMenu: React.FC = () => {
  const { createTable, ...commands } = useCommands();

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
        <button
          data-testid='btn-3-3'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: false })}
        >
          insert a 3*3 table
        </button>
        <button
          data-testid='btn-4-10'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => createTable({ rowsCount: 10, columnsCount: 4, withHeaderRow: false })}
        >
          insert a 4*10 table
        </button>
        <button
          data-testid='btn-3-30'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => createTable({ rowsCount: 30, columnsCount: 3, withHeaderRow: false })}
        >
          insert a 3*30 table
        </button>
        <button
          data-testid='btn-8-100'
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => createTable({ rowsCount: 100, columnsCount: 8, withHeaderRow: false })}
        >
          insert a 8*100 table
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

const ProsemirrorDocData: React.FC = () => {
  const ctx = useRemirrorContext({ autoUpdate: false });
  const [jsonPluginState, setJsonPluginState] = useState('');
  const [jsonDoc, setJsonDoc] = useState('');
  const { addHandler, view } = ctx;

  useEffect(() => {
    addHandler('updated', () => {
      setJsonDoc(JSON.stringify(view.state.doc.toJSON(), null, 2));

      const pluginStateValues = tableControllerPluginKey.getState(view.state)?.values;
      setJsonPluginState(
        JSON.stringify({ ...pluginStateValues, tableNodeResult: 'hidden' }, null, 2),
      );
    });
  }, [addHandler, view]);

  return (
    <div>
      <p>tableControllerPluginKey.getState(view.state)</p>
      <pre style={{ fontSize: '12px', lineHeight: '12px' }}>
        <code>{jsonPluginState}</code>
      </pre>
      <p>view.state.doc.toJSON()</p>
      <pre style={{ fontSize: '12px', lineHeight: '12px' }}>
        <code>{jsonDoc}</code>
      </pre>
    </div>
  );
};

const Table = ({
  children,
  extensions,
}: {
  children?: React.ReactElement;
  extensions: () => AnyExtension[];
}): JSX.Element => {
  const { manager, state } = useRemirror({ extensions, core: { excludeExtensions: ['history'] } });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state}>
        <EditorComponent />
        <TableComponents />
        <CommandMenu />
        <ProsemirrorDocData />
        {children}
      </Remirror>
    </ThemeProvider>
  );
};

const WithYjs = (): JSX.Element => {
  return <Table extensions={extensions} />;
};

const doc = new Y.Doc();

const extensions = () => [
  new ReactComponentExtension(),
  new TableExtension(),
  new YjsExtension({
    getProvider: () => new WebrtcProvider('remirror-react-tables', doc),
  }),
];

export default WithYjs;
