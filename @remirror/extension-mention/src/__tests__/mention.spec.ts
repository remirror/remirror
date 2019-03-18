import { createTestEditor, insertText } from 'jest-remirror';
import { Mention } from '../mention';

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
});

test('Mention plugin', () => {
  const onEnterMock = jest.fn();
  const onChangeMock = jest.fn();
  const id = 'mention';
  const label = `@${id}`;
  const { add, nodes, attrNodes, view } = createTestEditor(
    {
      attrNodes: [
        new Mention({
          name: 'mentionAt',
          onExit: ({ command, query }) => {
            command({ id: query!, label: `@${query}`, appendText: '' });
          },
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

  const docContent = doc(p('{<>}'));
  const { start } = add(docContent);
  insertText({ view, text: `This ${label} `, start });
  const { state } = view;
  expect(state.doc.content.child(0)).toEqualDocument(p('This ', mentionNode(), ' '));
  expect(onEnterMock).toHaveBeenCalledTimes(1);
  expect(onChangeMock).toHaveBeenCalledTimes(id.length - 1);
});

test.todo('Mention onKeyDown callback');
