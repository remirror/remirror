import React, { useMemo, useState } from 'react';
import { MentionAtomExtension, PlaceholderExtension } from 'remirror/extensions';
import {
  EditorComponent,
  MentionAtomPopupComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';

export default { title: 'Components (labs) / MentionAtom Popup' };

const extensions = () => [
  new MentionAtomExtension({
    extraAttributes: { type: 'user' },
    matchers: [{ name: 'at', char: '@', appendText: ' ', matchOffset: 0 }],
  }),
  new PlaceholderExtension({ placeholder: `Mention a @user` }),
];

const ALL_USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'sue', label: 'Sue' },
  { id: 'pat', label: 'Pat' },
  { id: 'tom', label: 'Tom' },
  { id: 'jim', label: 'Jim' },
];

export const Basic = () => {
  const [search, setSearch] = useState('');
  const { manager, state } = useRemirror({ extensions });
  const items = useMemo(() => {
    return ALL_USERS.filter((user) => user.label.toLowerCase().includes(search)).sort();
  }, [search]);

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <MentionAtomPopupComponent
          onChange={(state) => setSearch(state?.query.full.toLowerCase() ?? '')}
          items={items}
        />
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};
