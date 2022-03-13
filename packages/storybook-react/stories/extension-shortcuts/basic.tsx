import 'remirror/styles/all.css';

import { PlaceholderExtension, ShortcutsExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [
  new PlaceholderExtension({ placeholder: `Type (c) for copyright sign` }),
  new ShortcutsExtension(),
];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      />
    </ThemeProvider>
  );
};

export default Basic;
