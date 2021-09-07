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

function UserSuggestor({ allUsers }: { allUsers: MentionExtensionAttributes[] }): JSX.Element {
  const [users, setUsers] = useState<MentionExtensionAttributes[]>([]);
  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMention({
    items: users,
  });

  useEffect(() => {
    if (!state) {
      return;
    }

    const searchTerm = state.query.full.toLowerCase();
    const filteredUsers = allUsers
      .filter((user) => user.label.toLowerCase().includes(searchTerm))
      .sort()
      .slice(0, 5);
    setUsers(filteredUsers);
  }, [state, allUsers]);

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

  const allUsers = [
    { id: 'joe', label: 'Joe' },
    { id: 'sue', label: 'Sue' },
    { id: 'pat', label: 'Pat' },
    { id: 'tom', label: 'Tom' },
    { id: 'jim', label: 'Jim' },
  ];

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <UserSuggestor allUsers={allUsers} />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

export const MoreSupportedCharacters = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new MentionExtension({
        extraAttributes: { type: 'user' },
        matchers: [
          { name: 'at', char: '@', appendText: ' ', matchOffset: 0, supportedCharacters: /\S+/ },
        ],
      }),
      new PlaceholderExtension({ placeholder: `Mention @小` }),
    ],
    [],
  );

  const { manager } = useRemirror({ extensions, stringHandler: 'text' });

  const allUsers = [
    { id: 'chinese_xiaoming', label: '小明' },
    { id: 'chinese_xiaohong', label: '小红' },
    { id: 'chinese_xiaoqiang', label: '小强' },
  ];

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <UserSuggestor allUsers={allUsers} />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
