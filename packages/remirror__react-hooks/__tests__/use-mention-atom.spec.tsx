import { RemirrorTestChain } from 'jest-remirror';
import { FC, useEffect, useState } from 'react';
import { assertGet } from 'remirror';
import { act, DefaultEditor, render, strictRender } from 'testing/react';
import { NON_BREAKING_SPACE_CHAR } from '@remirror/core';
import { MentionAtomExtension, MentionAtomNodeAttributes } from '@remirror/extension-mention-atom';
import { ChangeReason } from '@remirror/pm/suggest';
import { createReactManager, MenuDirection, Remirror, useRemirror } from '@remirror/react';

import { MentionAtomState, useMentionAtom } from '../use-mention-atom';

describe('useMentionAtom', () => {
  it('should respond to mention changes', () => {
    const { editor, Wrapper, result } = createEditor();

    strictRender(<Wrapper />);

    expect(result.state).toBeNull();

    act(() => {
      editor.insertText('@a');
    });

    expect(result.state).toEqual({
      command: expect.any(Function),
      name: 'at',
      reason: ChangeReason.Start,
      query: { full: 'a', partial: 'a' },
      text: { full: '@a', partial: '@a' },
      range: { from: 17, to: 19, cursor: 19 },
    });
    expect(result.items.length > 0).toBeTrue();
    expect(result.index).toBe(0);
  });

  it('should correctly add the mention when the command is called', () => {
    const { editor, Wrapper, result } = createEditor();

    strictRender(<Wrapper />);

    acts([
      () => {
        editor.insertText('@a');
      },
      () => {
        result.state?.command({
          ...assertGet(result.items, 0),
          appendText: NON_BREAKING_SPACE_CHAR,
        });
      },
    ]);

    expect(result.state?.command).toBeUndefined();

    acts([
      () => {
        editor.insertText('more to come');
      },
    ]);

    expect(editor.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content
        <span role="presentation"
              href="//test.com/aa"
              class="remirror-mention-atom remirror-mention-atom-at"
              data-mention-atom-id="aa"
              data-mention-atom-name="at"
        >
          @aa
        </span>
        &nbsp;more to come
      </p>
    `);
  });

  it('should correctly add the mention when the command is called in a controlled editor', () => {
    const { editor, Wrapper, result } = createEditor(true);

    strictRender(<Wrapper />);

    for (const char of '@a') {
      act(() => {
        editor.insertText(char);
      });
    }

    act(() => {
      result.state?.command({ ...assertGet(result.items, 0), appendText: NON_BREAKING_SPACE_CHAR });
    });

    for (const char of 'more to come') {
      act(() => {
        editor.insertText(char);
      });
    }

    expect(editor.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content
        <span role="presentation"
              href="//test.com/aa"
              class="remirror-mention-atom remirror-mention-atom-at"
              data-mention-atom-id="aa"
              data-mention-atom-name="at"
        >
          @aa
        </span>
        &nbsp;more to come
      </p>
    `);
  });

  it('should not trap the cursor in the mention', () => {
    const { editor, Wrapper } = createEditor();

    render(<Wrapper />);

    acts([
      () => {
        editor.insertText('@a');
      },
      () => {
        editor.selectText(1);
      },
      () => {
        editor.insertText('ab ');
      },
    ]);

    expect(editor.innerHTML).toMatchInlineSnapshot(`
      <p>
        ab Initial content @a
      </p>
    `);
  });

  it('should clear suggestions when the `Escape` key is pressed', () => {
    const { editor, Wrapper, result } = createEditor();

    strictRender(<Wrapper />);

    acts([
      () => {
        editor.insertText('#a');
      },
      () => {
        editor.press('Escape');
      },
    ]);

    expect(result.state).toBeNull();

    act(() => {
      editor.insertText('a');
    });

    expect(result.state).toBeNull();
  });

  it('can set `ignoreMatchesOnDismiss` to false', () => {
    const { editor, Wrapper, result } = createEditor();

    strictRender(<Wrapper ignoreMatchesOnDismiss={false} />);

    acts([
      () => {
        editor.insertText('#a');
      },
      () => {
        editor.press('Escape');
      },
    ]);

    expect(result.state).toBeNull();

    act(() => {
      editor.insertText('a');
    });

    expect(result.state).toEqual(
      expect.objectContaining({ text: { full: '#aa', partial: '#aa' } }),
    );
  });

  it('should choose selection when `Enter` key is pressed', () => {
    const { editor, Wrapper } = createEditor();

    strictRender(<Wrapper />);

    acts([
      () => {
        editor.insertText('#a');
      },
      () => {
        editor.press('Enter');
      },
      () => {
        editor.insertText('more to come');
      },
    ]);

    expect(editor.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content
        <span role="presentation"
              href="//test.com/aa"
              class="remirror-mention-atom remirror-mention-atom-tag"
              data-mention-atom-id="aa"
              data-mention-atom-name="tag"
        >
          #AAi
        </span>
        more to come
      </p>
    `);
  });

  it('should update index when `Arrow` keys are used', () => {
    const { editor, Wrapper, result } = createEditor();

    strictRender(<Wrapper />);

    acts([
      () => {
        editor.insertText('#i');
      },
      () => {
        editor.press('ArrowDown');
      },
    ]);

    expect(result.index).toBe(1);

    acts([
      () => {
        editor.press('ArrowUp');
      },
      () => {
        editor.press('ArrowUp');
      },
    ]);

    expect(result.index).toBe(result.items.length - 1);
  });

  it('should update index when `Arrow` keys are used with a `horizontal` direction', () => {
    const { editor, Wrapper, result } = createEditor();

    strictRender(<Wrapper direction='horizontal' />);

    acts([
      () => {
        editor.insertText('#i');
      },
      () => {
        editor.press('ArrowRight');
      },
    ]);

    expect(result.index).toBe(1);

    acts([
      () => {
        editor.press('ArrowLeft');
      },
      () => {
        editor.press('ArrowLeft');
      },
    ]);

    expect(result.index).toBe(result.items.length - 1);
  });

  it('supports deleting the mention', () => {
    const { editor, Wrapper } = createEditor();

    strictRender(<Wrapper />);

    acts([
      () => {
        editor.insertText('@a');
      },
      () => {
        editor.press('Enter');
      },
      () => {
        editor.backspace(1);
      },
    ]);

    expect(editor.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content
      </p>
    `);
  });
});

/**
 * This function is used as a helper when testing the mention hooks.
 */
function createEditor(controlled = false) {
  const extensions = createReactManager(() => [
    new MentionAtomExtension({
      extraAttributes: { role: 'presentation', href: { default: null } },
      matchers: [
        { name: 'at', char: '@', appendText: ' ' },
        { name: 'tag', char: '#', appendText: ' ' },
      ],
    }),
  ]);

  const editor = RemirrorTestChain.create(extensions);
  const { doc, p } = editor.nodes;

  interface GetItemsProps {
    name: string;
    query: string;
  }

  const getItems = jest.fn((parameter?: GetItemsProps) => {
    if (!parameter) {
      return [];
    }

    const { name, query } = parameter;

    if (name === 'tag') {
      return allTags.filter((tag) => tag.label.toLowerCase().includes(query.toLowerCase()));
    }

    if (name === 'at') {
      return allUsers.filter((user) => user.label.toLowerCase().includes(query.toLowerCase()));
    }

    return [];
  });

  interface GetItemsProps {
    name: string;
    query: string;
  }

  interface Result {
    state: MentionAtomState | null;
    items: MentionAtomNodeAttributes[];
    index: number;
  }

  const result: Result = {
    state: null,
    items: [],
    index: -1,
  };

  interface Props {
    ignoreMatchesOnDismiss?: boolean;
    direction?: MenuDirection;
  }

  const Component: FC<Props> = ({ ignoreMatchesOnDismiss, direction }) => {
    const [items, setItems] = useState(() => getItems());

    const { state, index } = useMentionAtom({ items, ignoreMatchesOnDismiss, direction });
    result.items = items;
    result.state = state;
    result.index = index;

    useEffect(() => {
      if (!state) {
        return;
      }

      setItems(getItems({ name: state.name, query: state.query.full }));
    }, [state]);

    return null;
  };

  const hookProps = controlled
    ? { content: doc(p('Initial content ')), selection: 'end' as const }
    : {};

  const Wrapper: FC<Props> = (props) => {
    const { onChange, state, manager } = useRemirror({
      extensions,
      ...hookProps,
    });

    return (
      <Remirror
        manager={manager}
        onChange={controlled ? onChange : undefined}
        state={controlled ? state : undefined}
        initialContent={controlled ? undefined : [doc(p('Initial content ')), 'end']}
      >
        <DefaultEditor />
        <Component {...props} />
      </Remirror>
    );
  };

  return { editor, Wrapper, result };
}

function acts(methods: Array<() => void | undefined>) {
  for (const method of methods) {
    act(method);
  }
}

const allUsers: MentionAtomNodeAttributes[] = [
  {
    label: '@aa',
    href: '//test.com/aa',
    id: 'aa',
    appendText: '',
  },
  {
    label: '@bb',
    href: '//test.com/bb',
    id: 'bb',
  },
  {
    label: '@cc',
    href: '//test.com/cc',
    id: 'cc',
  },
  {
    label: '@dd',
    href: '//test.com/dd',
    id: 'dd',
  },
];

const allTags: MentionAtomNodeAttributes[] = [
  { label: '#AAi', href: '//test.com/aa', id: 'aa' },
  { label: '#BBi', href: '//test.com/bb', id: 'bb' },
  { label: '#CCi', href: '//test.com/cc', id: 'cc' },
  { label: '#DDi', href: '//test.com/dd', id: 'dd' },
  { label: '#EEi', href: '//test.com/ee', id: 'ee' },
  { label: '#FFi', href: '//test.com/ff', id: 'ff' },
  { label: '#GGi', href: '//test.com/gg', id: 'gg' },
  { label: '#HHi', href: '//test.com/hh', id: 'hh' },
];
