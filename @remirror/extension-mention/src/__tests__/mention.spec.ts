import { renderEditor } from 'jest-remirror';
import { Mention, MentionOptions } from '../';

describe('Base Mention', () => {
  it('is created with the correct options', () => {
    const matcher = {
      char: '@',
      allowSpaces: false,
      startOfLine: false,
    };
    const mentions = new Mention({
      matcher,
      name: 'mention',
    });

    expect(mentions.options.matcher).toEqual(matcher);
    expect(mentions.name).toEqual('mention');
  });
  it('uses can be created with partial matchers', () => {
    const mentionOne = new Mention({
      name: 'mentionHash',
      matcher: { char: '#' },
    });
    expect(mentionOne.options.matcher).toEqual({ char: '#' });
    expect(mentionOne.name).toBe('mentionHash');
  });

  it('throws when created with an invalid name', () => {
    expect(() => {
      return new Mention({
        name: 'randomName',
        matcher: { char: '#' },
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"The mention plugin must begin start with the word 'mention' and not randomName"`,
    );
  });
});

describe('plugin', () => {
  const options = {
    name: 'mentionAt' as 'mentionAt',
    mentionClassName: 'custom',
  };

  const mocks = {
    onEnter: jest.fn(),
    onChange: jest.fn(),
    onKeyDown: jest.fn(),
    onExit: jest.fn(),
  };

  it('uses default noop callbacks', () => {
    const id = 'mention';
    const label = `@${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      view,
    } = renderEditor({
      attrNodes: [new Mention(options)],
    });

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p(`This ${label} `));
  });

  it('injects the mention at the correct place', () => {
    const id = 'mention';
    const label = `@${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      attrNodes: { mentionAt },
      view,
    } = renderEditor(
      {
        attrNodes: [
          new Mention({
            ...options,
            ...mocks,
            onExit: ({ command, query }) => {
              command({ id: query!, label: `@${query}`, appendText: '' });
            },
          }),
        ],
      },
      {},
    );

    const mentionNode = mentionAt({ id, label });

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p('This ', mentionNode(), ' '));
    expect(mocks.onEnter).toHaveBeenCalledTimes(1);
    expect(mocks.onChange).toHaveBeenCalledTimes(id.length - 1);
    expect(mocks.onKeyDown).toHaveBeenCalledTimes(id.length);
  });
});

const create = (params: MentionOptions<'mentionAt'> = { name: 'mentionAt' }) =>
  renderEditor({
    attrNodes: [new Mention({ name: 'mentionAt', mentionClassName: 'custom', ...params })],
  });

describe('Mention#command', () => {
  let {
    nodes: { doc, paragraph },
    view,
    attrNodes: { mentionAt },
    actions,
    add,
  } = create();

  beforeEach(() => {
    ({
      nodes: { doc, paragraph },
      view,
      attrNodes: { mentionAt },
      actions,
      add,
    } = create());
  });

  it('replaces text at the current position', () => {
    add(doc(paragraph('This is ', '<cursor>')));
    const attrs = { id: 'test', label: '@test' };

    actions.mentionAt.command(attrs);

    expect(view.state).toContainRemirrorDocument(paragraph('This is ', mentionAt(attrs)()));
  });
});
