import { useEffect, useState } from 'react';
import type { AnyExtension } from 'remirror';
import { YjsExtension } from 'remirror/extensions';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { ProsemirrorDevTools } from '@remirror/dev';
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

export default { title: 'Extensions / ReactTables (complex)' };

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
          onClick={() => createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: false })}
        >
          insert a 3*3 table
        </button>
        <button
          data-testid='btn-4-10'
          onClick={() => createTable({ rowsCount: 10, columnsCount: 4, withHeaderRow: false })}
        >
          insert a 4*10 table
        </button>
        <button
          data-testid='btn-3-30'
          onClick={() => createTable({ rowsCount: 30, columnsCount: 3, withHeaderRow: false })}
        >
          insert a 3*30 table
        </button>
        <button
          data-testid='btn-8-100'
          onClick={() => createTable({ rowsCount: 100, columnsCount: 8, withHeaderRow: false })}
        >
          insert a 8*100 table
        </button>
        <button onClick={() => commands.addTableColumnAfter()}>
          add a column after the current one
        </button>
        <button onClick={() => commands.addTableRowBefore()}>
          add a row before the current one
        </button>
        <button onClick={() => commands.deleteTable()}>delete the table</button>
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

export const Basic = () => {
  return (
    <Table extensions={defaultExtensions}>
      <ProsemirrorDevTools />
    </Table>
  );
};

export const TableWithYjs = () => {
  return (
    <Table extensions={yjsExtensions}>
      <ProsemirrorDevTools />
    </Table>
  );
};

const defaultExtensions = () => [new ReactComponentExtension(), new TableExtension()];

const doc = new Y.Doc();
const yjsExtensions = () => [
  ...defaultExtensions(),
  new YjsExtension({
    getProvider: () => new WebrtcProvider('remirror-react-tables', doc),
  }),
];
