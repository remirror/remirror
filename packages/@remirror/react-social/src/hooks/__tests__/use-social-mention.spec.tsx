import { fireEvent } from '@testing-library/dom';
import { act, renderHook } from '@testing-library/react-hooks';
import { RemirrorTestChain } from 'jest-remirror';
import React, { FC } from 'react';

import { NON_BREAKING_SPACE_CHAR } from '@remirror/core';
import { createReactManager } from '@remirror/react';

import { SocialProvider } from '../../components/social-provider';
import { MentionChangeParameter, TagData, UserData } from '../../social-types';
import { socialManagerArgs } from '../../social-utils';
import { useSocialRemirror } from '../use-social';
import { useSocialMention } from '../use-social-mention';

jest.useFakeTimers();

describe('useSocialMention', () => {
  it('should respond to mention changes', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();

    const { result } = renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current).toEqual({
      index: 0,
      matcher: undefined,
      command: undefined,
      show: true,
    });

    act(() => {
      chain.insertText('@a');
    });

    expect(result.current.command).toBeFunction();
    expect(getUsers().length > 0).toBeTrue();
  });

  it('should `show: false` when losing focus', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();
    const { result } = renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      fireEvent.blur(chain.dom);
      jest.runAllTimers();
    });

    expect(result.current).toEqual({
      index: 0,
      matcher: undefined,
      command: undefined,
      show: false,
    });

    act(() => {
      fireEvent.focus(chain.dom);
      jest.runAllTimers();
    });

    expect(result.current).toEqual({
      index: 0,
      matcher: undefined,
      command: undefined,
      show: true,
    });
  });

  it('should correctly add the mention when the command is called', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();

    const { result } = renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    acts([
      () => {
        chain.insertText('@a');
      },
      () => result.current.command?.({ appendText: NON_BREAKING_SPACE_CHAR }),
      () => {
        chain.insertText('more to come');
      },
    ]);

    expect(chain.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content
        <a role="presentation"
           class="mention mention-at"
           data-mention-id="a"
           data-mention-name="at"
        >
          @a
        </a>
        &nbsp;more to come
      </p>
    `);
  });

  it('should not trap the cursor in the mention', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();

    renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    acts([
      () => {
        chain.insertText('@a').selectText(1).insertText('ab ');
      },
    ]);

    expect(chain.innerHTML).toMatchInlineSnapshot(`
      <p>
        ab Initial content
        <a role="presentation"
           href="/a"
           class="mention mention-at"
           data-mention-id="a"
           data-mention-name="at"
        >
          @a
        </a>
      </p>
    `);
  });

  it('should clear suggestions when the `Escape` key is pressed', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();

    const { result } = renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    acts([
      () => {
        chain.insertText('#a');
      },
      () => {
        chain.press('Escape');
      },
    ]);

    expect(result.current).toEqual({
      index: 0,
      matcher: undefined,
      command: undefined,
      show: true,
    });
  });

  it('should choose selection when `Enter` key is pressed', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();

    renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    acts([
      () => {
        chain.insertText('#a');
      },
      () => {
        chain.press('Enter');
      },
      () => {
        chain.insertText('more to come');
      },
    ]);

    expect(chain.innerHTML).toMatchInlineSnapshot(`
      <p>
        Initial content
        <a role="presentation"
           href="//test.com/aa"
           class="mention mention-tag"
           data-mention-id="aa"
           data-mention-name="tag"
        >
          #AAi
        </a>
        more to come
      </p>
    `);
  });

  it('should update index when `Arrow` keys are used', () => {
    const { chain, Wrapper, getTags, getUsers, onChange } = createChain();

    const { result } = renderHook(
      () => useSocialMention({ users: getUsers(), tags: getTags(), onMentionChange: onChange }),
      {
        wrapper: Wrapper,
      },
    );

    acts([
      () => {
        chain.insertText('#i');
      },
      () => {
        chain.press('ArrowDown');
      },
    ]);

    expect(result.current.index).toBe(1);

    acts([
      () => {
        chain.press('ArrowUp');
      },
      () => {
        chain.press('ArrowUp');
      },
    ]);

    expect(result.current.index).toBe(getTags().length - 1);
  });
});

function createChain() {
  const manager = createReactManager(...socialManagerArgs([]));
  const chain = RemirrorTestChain.create(manager);
  const { doc, p } = chain.nodes;

  let users: UserData[] = [];
  let tags: TagData[] = [];

  const onChange = jest.fn((params?: MentionChangeParameter) => {
    if (!params) {
      users = [];
      tags = [];

      return;
    }

    if (params.name === 'tag') {
      tags = allTags.filter((tag) => tag.tag.toLowerCase().includes(params.query.toLowerCase()));
    }

    if (params.name === 'at') {
      users = allUsers.filter((user) =>
        user.username.toLowerCase().includes(params.query.toLowerCase()),
      );
    }
  });

  const InnerComponent: FC = ({ children }) => {
    const { getRootProps } = useSocialRemirror();

    return (
      <>
        {children}
        <div {...getRootProps()} />
      </>
    );
  };

  const Wrapper: FC = ({ children }) => {
    return (
      <SocialProvider manager={manager} initialContent={[doc(p('Initial content ')), 'end']}>
        <InnerComponent>{children}</InnerComponent>
      </SocialProvider>
    );
  };

  return { chain, Wrapper, getUsers: () => users, getTags: () => tags, onChange };
}

function acts(methods: Array<() => void | undefined>) {
  for (const method of methods) {
    act(method);
  }
}

const allUsers: UserData[] = [
  {
    avatarUrl: '//test.com/aa/img.jpg',
    displayName: 'AA',
    username: 'aa',
    href: '//test.com/aa',
    id: 'aa',
  },
  {
    avatarUrl: '//test.com/bb/img.jpg',
    displayName: 'BB',
    username: 'bb',
    href: '//test.com/bb',
    id: 'bb',
  },
  {
    avatarUrl: '//test.com/cc/img.jpg',
    displayName: 'CC',
    username: 'cc',
    href: '//test.com/cc',
    id: 'cc',
  },
  {
    avatarUrl: '//test.com/dd/img.jpg',
    displayName: 'DD',
    username: 'dd',
    href: '//test.com/dd',
    id: 'dd',
  },
];

const allTags: TagData[] = [
  { tag: 'AAi', href: '//test.com/aa', id: 'aa' },
  { tag: 'BBi', href: '//test.com/bb', id: 'bb' },
  { tag: 'CCi', href: '//test.com/cc', id: 'cc' },
  { tag: 'DDi', href: '//test.com/dd', id: 'dd' },
  { tag: 'EEi', href: '//test.com/ee', id: 'ee' },
  { tag: 'FFi', href: '//test.com/ff', id: 'ff' },
  { tag: 'GGi', href: '//test.com/gg', id: 'gg' },
  { tag: 'HHi', href: '//test.com/hh', id: 'hh' },
];
