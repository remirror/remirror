import { insertText, renderEditor } from 'jest-remirror';
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
  it('does nothing without invoking the callbacks', () => {
    const id = 'mention';
    const label = `@${id}`;
    const { add, nodes, view } = renderEditor(
      {
        attrNodes: [
          new Mention({
            name: 'mentionAt',
            mentionClassName: 'custom',
          }),
        ],
      },
      {},
    );

    const { doc, paragraph: p } = nodes;

    const docContent = doc(p('{<>}'));
    const { start } = add(docContent);
    insertText({ view, text: `This ${label} `, start });
    const { state } = view;
    expect(state.doc.content.child(0)).toEqualRemirrorDocument(p(`This ${label} `));
  });

  it('injects the mention at the correct place', () => {
    const onEnterMock = jest.fn();
    const onChangeMock = jest.fn();
    const onKeyDownMock = jest.fn();
    const id = 'mention';
    const label = `@${id}`;
    const { add, nodes, attrNodes, view } = renderEditor(
      {
        attrNodes: [
          new Mention({
            name: 'mentionAt',
            onExit: ({ command, query }) => {
              command({ id: query!, label: `@${query}`, appendText: '' });
            },
            onKeyDown: onKeyDownMock,
            onEnter: onEnterMock,
            onChange: onChangeMock,
          }),
        ],
      },
      {},
    );

    const { doc, paragraph: p } = nodes;
    const { mentionAt } = attrNodes;
    const mentionNode = mentionAt({ id, label });

    const { start } = add(doc(p('{<>}')));
    insertText({ view, text: `This ${label} `, start });
    expect(view.state.doc.content.child(0)).toEqualRemirrorDocument(p('This ', mentionNode(), ' '));
    expect(onEnterMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledTimes(id.length - 1);
    expect(onKeyDownMock).toHaveBeenCalledTimes(id.length);
  });
});

describe('command', () => {
  const create = (params: MentionOptions<'mentionAt'> = { name: 'mentionAt' }) => {
    const { nodes, view, schema, attrNodes, actions, add } = renderEditor({
      attrNodes: [new Mention({ name: 'mentionAt', mentionClassName: 'custom', ...params })],
    });
    const { doc, paragraph } = nodes;
    const { mentionAt } = attrNodes;
    return { view, schema, doc, paragraph, mentionAt, actions, add };
  };
  let props: ReturnType<typeof create>;

  beforeEach(() => {
    props = create();
  });

  it('replaces text at the current position', () => {
    const { view, actions, doc, mentionAt, paragraph: p, add } = props;
    add(doc(p('This is ', '{<>}')));
    const attrs = { id: 'test', label: '@test' };
    actions.mentionAt.command(attrs);
    expect(view.state.doc.content.child(0)).toEqualRemirrorDocument(p('This is ', mentionAt(attrs)()));
  });
});
