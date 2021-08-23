import './use-mention-atom-styles.css';

import { useCallback, useEffect, useState } from 'react';
import { cx } from 'remirror';
import {
  MentionExtension,
  MentionExtensionAttributes,
  PlaceholderExtension,
} from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { FloatingWrapper, Remirror, ThemeProvider, useMention, useRemirror } from '@remirror/react';

export default { title: 'React Hooks / useMention' };

const ALL_USERS = [
  { id: 'joe', label: 'Joe' },
  { id: 'sue', label: 'Sue' },
  { id: 'pat', label: 'Pat' },
  { id: 'tom', label: 'Tom' },
  { id: 'jim', label: 'Jim' },
];

function UserSuggestor() {
  const [users, setUsers] = useState<MentionExtensionAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMention({
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

export const Basic = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new MentionExtension({
        extraAttributes: { type: 'user' },
        matchers: [{ name: 'at', char: '@', appendText: ' ', matchOffset: 0 }],
      }),
      new PlaceholderExtension({ placeholder: `Mention a @user` }),
    ],
    [],
  );
  const { manager } = useRemirror({ extensions });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <UserSuggestor />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
