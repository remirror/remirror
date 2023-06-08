import './use-mention-atom-styles.css';

import { filter } from 'fuzzaldrin';
import React, { useEffect, useState } from 'react';
import { cx } from 'remirror';
import {
  MentionAtomExtension,
  MentionAtomNodeAttributes,
  PlaceholderExtension,
} from 'remirror/extensions';
import {
  FloatingWrapper,
  Remirror,
  ThemeProvider,
  useMentionAtom,
  useRemirror,
} from '@remirror/react';

export default { title: 'React Hooks / useMentionAtom' };

const ALL_USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'sue', label: 'Sue' },
  { id: 'pat', label: 'Pat' },
  { id: 'tom', label: 'Tom' },
  { id: 'jim', label: 'Jim' },
];

function UserSuggestor() {
  const [users, setUsers] = useState<MentionAtomNodeAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
    items: users,
  });

  useEffect(() => {
    if (!state) {
      return;
    }

    const searchTerm = state.query.full.toLowerCase();
    const filteredUsers = ALL_USERS.filter((user) => user.label.toLowerCase().includes(searchTerm))
      .sort()
      .slice(0, 5);
    setUsers(filteredUsers);
  }, [state]);

  const enabled = !!state;

  return (
    <FloatingWrapper positioner='cursor' enabled={enabled} placement='bottom-start'>
      <div {...getMenuProps()} className='suggestions'>
        {enabled &&
          users.map((user, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);

            return (
              <div
                key={user.id}
                className={cx('suggestion', isHighlighted && 'highlighted', isHovered && 'hovered')}
                {...getItemProps({
                  item: user,
                  index,
                })}
              >
                {user.label}
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
}

const MCU_CHARACTERS: MentionAtomNodeAttributes[] = [
  {
    label: 'Ant-Man',
    id: 'ant-man',
  },
  {
    label: 'Black Widow',
    id: 'black-widow',
  },
  {
    label: 'Captain America',
    id: 'captain-america',
  },
  {
    label: 'Iron Man',
    id: 'iron-man',
  },
  {
    label: 'Hawkeye',
    id: 'hawkeye',
  },
  {
    label: 'Hulk',
    id: 'hulk',
  },
  {
    label: 'M.O.D.O.K.',
    id: 'modok',
  },
  {
    label: 'Spider-Man',
    id: 'spider-man',
  },
  {
    label: 'Star-Lord',
    id: 'spider-man',
  },
  {
    label: "T'Challa",
    id: 't-challa',
  },
  {
    label: 'Thor',
    id: 'thor',
  },
];

function MCUSuggestor() {
  const [users, setUsers] = useState<MentionAtomNodeAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
    items: users,
    replacementType: 'partial',
  });

  useEffect(() => {
    if (!state) {
      return;
    }

    const searchTerm = state.query.partial.toLowerCase();
    const filteredCharacters = filter(MCU_CHARACTERS, searchTerm, { key: 'label' });
    setUsers(filteredCharacters);
  }, [state]);

  const enabled = !!state;

  return (
    <FloatingWrapper positioner='cursor' enabled={enabled} placement='bottom-start'>
      <div {...getMenuProps()} className='suggestions'>
        {enabled &&
          users.map((user, index) => {
            const isHighlighted = indexIsSelected(index);
            const isHovered = indexIsHovered(index);

            return (
              <div
                key={user.id}
                className={cx('suggestion', isHighlighted && 'highlighted', isHovered && 'hovered')}
                {...getItemProps({
                  item: user,
                  index,
                })}
              >
                {user.label}
              </div>
            );
          })}
      </div>
    </FloatingWrapper>
  );
}

const extensions = () => [
  new MentionAtomExtension({
    extraAttributes: { type: 'user' },
    matchers: [{ name: 'at', char: '@', matchOffset: 0 }],
  }),
  new PlaceholderExtension({ placeholder: `Mention a @user` }),
];

export const Basic = (): JSX.Element => {
  const { manager } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <UserSuggestor />
      </Remirror>
    </ThemeProvider>
  );
};

export const PrefilledContent = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions,
    content:
      '<p>Hi <span type="user" class="remirror-mention-atom remirror-mention-atom-at" data-mention-atom-id="sue" data-mention-atom-name="at">Sue</span> </p>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end' initialContent={state}>
        <UserSuggestor />
      </Remirror>
    </ThemeProvider>
  );
};

export const IncludingWhitespace = (): JSX.Element => {
  const extensions = () => [
    new MentionAtomExtension({
      extraAttributes: { type: 'mcu' },
      matchers: [{ name: 'at', char: '@', matchOffset: 1, supportedCharacters: /\w[\s\w'.]*/ }],
      appendText: '',
    }),
    new PlaceholderExtension({
      placeholder: `Mention a Marvel Cinematic Universe (MCU) character with @`,
    }),
  ];

  const { manager, state } = useRemirror({
    extensions,
    content:
      '<p>In the Marvel Cinematic Universe (MCU), @<cursor> is the superhero persona of Tony Stark.</p>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end' initialContent={state}>
        <MCUSuggestor />
      </Remirror>
    </ThemeProvider>
  );
};
