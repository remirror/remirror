import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';

import { entries, fromHTML, GetHandler, toHTML } from '@remirror/core';
import { SuggestCommandParameter } from '@remirror/pm/suggest';
import { createBaseManager } from '@remirror/test-fixtures';

import { MentionExtension, MentionExtensionSuggestCommand, MentionOptions } from '..';

describe('schema', () => {
  const { schema } = createBaseManager({
    extensions: [new MentionExtension({ matchers: [{ char: '@', name: 'at' }] })],
    presets: [],
  });
  const attributes = { id: 'test', label: '@test', name: 'testing' };

  const { mention, p, doc } = pmBuild(schema, {
    mention: { markType: 'mention', ...attributes },
  });

  it('creates the correct dom node', () => {
    expect(toHTML({ node: p(mention(attributes.label)), schema })).toMatchInlineSnapshot(`
      <p>
        <a class="mention mention-testing"
           data-mention-id="test"
           data-mention-name="testing"
        >
          @test
        </a>
      </p>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHTML({
      schema,
      content: `<a class="mention mention-at" data-mention-id="${attributes.id}" data-mention-name="${attributes.name}">${attributes.label}</a>`,
    });
    const expected = doc(p(mention(attributes.label)));

    expect(node).toEqualProsemirrorNode(expected);
  });

  describe('extraAttributes', () => {
    const custom = 'test';
    const { schema } = createBaseManager({
      extensions: [
        new MentionExtension({
          matchers: [],
          extraAttributes: { 'data-custom': { default: null } },
        }),
      ],
      presets: [],
    });

    const { doc, p, mention } = pmBuild(schema, {
      mention: { markType: 'mention', ['data-custom']: custom, ...attributes },
    });

    it('parses the dom structure and finds itself with custom attributes', () => {
      const node = fromHTML({
        schema,
        content: `<a class="mention mention-at" data-custom="${custom}" data-mention-id="${attributes.id}" data-mention-name="${attributes.name}">${attributes.label}</a>`,
      });

      const expected = doc(p(mention(attributes.label)));

      expect(node).toEqualProsemirrorNode(expected);
    });
  });
});

describe('constructor', () => {
  it('is created with the correct options', () => {
    const matcher = {
      char: '@',
      allowSpaces: false,
      startOfLine: false,
      name: 'at',
    };
    const mentions = new MentionExtension({
      matchers: [matcher],
    });

    expect(mentions.options.matchers).toEqual([matcher]);
    expect(mentions.name).toEqual('mention');
  });

  it('can be created with partial matchers', () => {
    const mentionOne = new MentionExtension({
      matchers: [{ char: '#', name: 'tag' }],
    });

    expect(mentionOne.options.matchers).toEqual([{ char: '#', name: 'tag' }]);
  });
});

function create(options: MentionOptions, handlers: GetHandler<MentionOptions> = {}) {
  const extension = new MentionExtension({ ...options });

  for (const [key, handler] of entries(handlers)) {
    extension.addHandler(key, handler);
  }

  const {
    add,
    nodes: { doc, p },
    attributeMarks: { mention },
    view,
    manager,
    commands,
  } = renderEditor([extension]);

  return { add, doc, p, mention, view, manager, commands };
}

describe('plugin', () => {
  const options: MentionOptions = {
    matchers: [
      { char: '#', name: 'tag', mentionClassName: 'custom' },
      { char: '@', name: 'at', mentionClassName: 'custom' },
      { char: '+', name: 'plus', mentionClassName: 'custom' },
    ],
  };

  const mocks = {
    onChange: jest.fn(),
    onExit: jest.fn(({ command }: SuggestCommandParameter<MentionExtensionSuggestCommand>) => {
      command({ appendText: '' });
    }),
  };

  const id = 'mention';
  const label = `@${id}`;

  it('uses default noop callbacks and does nothing', () => {
    const noop = {
      onChange: jest.fn(),
      onExit: jest.fn(),
    };

    const { add, doc, p } = create(options, noop);

    add(doc(p('<cursor>')))
      .insertText(`This ${label} `)
      .callback(({ state }) => {
        expect(state).toContainRemirrorDocument(p(`This ${label} `));
        expect(noop.onChange).toHaveBeenCalledTimes(7);
        expect(noop.onExit).toHaveBeenCalledTimes(1);
      });
  });

  const { add, doc, p, mention, view } = create(options, mocks);
  const mentionMark = mention({ id, label, name: 'at' });

  it('should support onExit', () => {
    add(doc(p('<cursor>'))).insertText(`${label} `);
    expect(view.state).toContainRemirrorDocument(p(mentionMark(label), ' '));
  });

  it('should handle joined text separated by space', () => {
    add(doc(p('hello <cursor>friend'))).insertText(`${label} `);
    expect(view.state).toContainRemirrorDocument(p('hello ', mentionMark(label), ' friend'));
  });

  it('can split mentions', () => {
    const splitMention = mention({ id: '123', label: '@123', name: 'at' });
    add(doc(p(splitMention('@1<cursor>23')))).insertText(` `);
    expect(view.state).toContainRemirrorDocument(
      p(mention({ id: '1', label: '@1', name: 'at' })('@1'), ' 23'),
    );
  });

  it('removes invalid mentions', () => {
    const splitMention = mention({ id: '123', label: '@123', name: 'at' });
    add(doc(p(splitMention('@<cursor>123')))).insertText(` `);

    expect(view.state).toContainRemirrorDocument(p('@ 123'));
  });

  it('decorates split mentions', () => {
    add(doc(p('hello <cursor>friend'))).insertText(`${label}`);

    expect(view.dom).toContainHTML('<a class="suggest suggest-at">@mentionfriend</a>');
  });

  it('injects the mention at the correct place', () => {
    add(doc(p('<cursor>'))).insertText(`This ${label} `);

    expect(view.state).toContainRemirrorDocument(p('This ', mentionMark(label), ' '));
    expect(mocks.onChange).toHaveBeenCalledTimes(id.length);
  });

  it('supports deleting content', () => {
    add(doc(p('<cursor>')))
      .insertText(`@1`)
      .dispatchCommand(({ state, dispatch }) => {
        if (dispatch) {
          dispatch(state.tr.delete(0, state.selection.head));
        }

        return true;
      })
      .callback(({ doc }) => {
        expect(doc).toMatchSnapshot();
      });
  });

  it('supports multiple characters', () => {
    const labelFn = (char: string) => `${char}${id}`;

    const hashMark = mention({ id, label: labelFn('#'), name: 'tag' });
    const plusMark = mention({ id, label: labelFn('+'), name: 'plus' });
    const atMark = mention({ id, label: labelFn('@'), name: 'at' });

    add(doc(p('<cursor>'))).insertText(`This ${labelFn('#')} `);
    expect(view.state).toContainRemirrorDocument(p('This ', hashMark(labelFn('#')), ' '));

    add(doc(p('<cursor>'))).insertText(`This ${labelFn('+')} `);
    expect(view.state).toContainRemirrorDocument(p('This ', plusMark(labelFn('+')), ' '));

    add(doc(p('<cursor>'))).insertText(`This ${labelFn('@')} `);
    expect(view.state).toContainRemirrorDocument(p('This ', atMark(labelFn('@')), ' '));
  });
});

describe('pasteRules', () => {
  const options = {
    matchers: [
      { char: '#', name: 'tag' },
      { char: '@', name: 'at' },
      { char: '+', name: 'plus' },
    ],
  };

  const { add, doc, p, mention } = create(options);

  it('supports pasted content', () => {
    add(doc(p('<cursor>')))
      .paste(p('This is text @hello'))
      .callback(({ state }) => {
        const expectedMention = mention({ id: '@hello', name: 'at', label: '@hello' })('@hello');
        const expected = p('This is text ', expectedMention);

        expect(state).toContainRemirrorDocument(expected);
      });
  });

  it('supports pasting multiple matchers', () => {
    const at = mention({ id: '@hello', name: 'at', label: '@hello' })('@hello');
    const plus = mention({ id: '+awesome', name: 'plus', label: '+awesome' })('+awesome');
    const tag = mention({ id: '#12', name: 'tag', label: '#12' })('#12');

    add(doc(p('<cursor>')))
      .paste(p('#12 +awesome @hello'))
      .callback((content) => {
        expect(content.state).toContainRemirrorDocument(p(tag, ' ', plus, ' ', at));
      });
  });
});

describe('commands', () => {
  const options = {
    matchers: [
      { char: '#', name: 'tag' },
      { char: '@', name: 'at' },
      { char: '+', name: 'plus' },
    ],
  };

  const { add, doc, p, mention, view, commands } = create(options);

  const attributes = { id: 'test', label: '@test', name: 'at', appendText: '' };

  describe('createMention', () => {
    it('replaces text at the current position by default', () => {
      add(doc(p('This is ', '<cursor>')));
      commands.createMention(attributes);

      expect(view.state).toContainRemirrorDocument(
        p('This is ', mention(attributes)(attributes.label)),
      );
    });

    it('replaces text at the specified position', () => {
      add(doc(p('This is ', '<cursor>')));
      commands.createMention({ ...attributes, range: { from: 1, to: 1, end: 1 } });

      expect(view.state).toContainRemirrorDocument(
        p(mention(attributes)(attributes.label), 'This is '),
      );
    });

    it('throws when invalid config passed into the command', () => {
      add(doc(p('This is ', '<cursor>')));

      // @ts-expect-error
      expect(() => commands.createMention()).toThrowErrorMatchingSnapshot();

      // @ts-expect-error
      expect(() => commands.createMention({})).toThrowErrorMatchingSnapshot();

      expect(() =>
        commands.createMention({ ...attributes, id: '' }),
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        commands.createMention({ ...attributes, label: '' }),
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        commands.createMention({ ...attributes, name: 'invalid' }),
      ).toThrowErrorMatchingSnapshot();
      expect(() =>
        commands.createMention({ ...attributes, name: undefined }),
      ).toThrowErrorMatchingSnapshot();
    });
  });
});
