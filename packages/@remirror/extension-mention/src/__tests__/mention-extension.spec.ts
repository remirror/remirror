import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { ItalicExtension } from 'remirror/extension/italic';
import { createCoreManager } from 'remirror/preset/core';

import { fromHtml, toHtml } from '@remirror/core';
import { hideConsoleError } from '@remirror/testing';

import { MentionExtension, MentionOptions } from '..';
import type { MentionChangeHandler } from '../mention-extension';

extensionValidityTest(MentionExtension, { matchers: [] });

describe('schema', () => {
  const { schema } = createCoreManager([
    new MentionExtension({ matchers: [{ char: '@', name: 'at' }] }),
  ]);
  const attributes = { id: 'test', label: '@test', name: 'testing' };

  const { mention, p, doc } = pmBuild(schema, {
    mention: { markType: 'mention', ...attributes },
  });

  it('creates the correct dom node', () => {
    expect(toHtml({ node: p(mention(attributes.label)), schema })).toMatchInlineSnapshot(`
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
    const node = fromHtml({
      schema,
      content: `<a class="mention mention-at" data-mention-id="${attributes.id}" data-mention-name="${attributes.name}">${attributes.label}</a>`,
    });
    const expected = doc(p(mention(attributes.label)));

    expect(node).toEqualProsemirrorNode(expected);
  });

  describe('extraAttributes', () => {
    const custom = 'test';
    const { schema } = createCoreManager([
      new MentionExtension({
        matchers: [],
        extraAttributes: { 'data-custom': { default: null } },
      }),
    ]);

    const { doc, p, mention } = pmBuild(schema, {
      mention: { markType: 'mention', ['data-custom']: custom, ...attributes },
    });

    it('parses the dom structure and finds itself with custom attributes', () => {
      const node = fromHtml({
        schema,
        content: `<a class="mention mention-at" data-custom="${custom}" data-mention-id="${attributes.id}" data-mention-name="${attributes.name}">${attributes.label}</a>`,
      });

      const expected = doc(p(mention(attributes.label)));

      expect(node).toEqualProsemirrorNode(expected);
    });
  });
});

/**
 * Create the mention extension with an optional `onChange` handler.
 */
function create(options: MentionOptions, onChange: MentionChangeHandler = () => {}) {
  const extension = new MentionExtension({ ...options });
  const editor = renderEditor([extension, new ItalicExtension()]);
  const { add, view, manager, commands } = editor;
  const { doc, p } = editor.nodes;
  const { mention } = editor.attributeMarks;

  // Add the onChange handler to the extension and also give it access to the commands.
  extension.addHandler('onChange', onChange);

  return { add, doc, p, mention, view, manager, commands, editor };
}

describe('`createSuggesters`', () => {
  const options: MentionOptions = {
    matchers: [
      { char: '#', name: 'tag', mentionClassName: 'custom' },
      { char: '@', name: 'at', mentionClassName: 'custom' },
      { char: '+', name: 'plus', mentionClassName: 'custom' },
    ],
  };

  const id = 'mention';
  const label = `@${id}`;

  it('uses default noop callbacks and does nothing', () => {
    const noop = jest.fn();
    const { add, doc, p } = create(options, noop);

    add(doc(p('<cursor>')))
      .insertText(`This ${label} `)
      .callback(({ state }) => {
        expect(state).toContainRemirrorDocument(p(`This ${label} `));
        expect(noop).toHaveBeenCalledTimes(8);
      });
  });

  const change = jest.fn();

  // The default `onChange` handler. Make sure to include this in future work.
  const onChange: MentionChangeHandler = jest.fn((parameter, command) => {
    if (parameter.exitReason) {
      command();
    }

    if (parameter.changeReason) {
      change();
    }
  });

  const { add, doc, p, mention, view, editor } = create(options, onChange);
  const mentionMark = mention({ id, label, name: 'at' });

  it('should support exits', () => {
    add(doc(p('<cursor>'))).insertText(`${label} `);
    expect(view.state).toContainRemirrorDocument(p(mentionMark(label), ' '));
  });

  it('should handle joined text separated by space', () => {
    add(doc(p('hello <cursor>friend'))).insertText(`${label} `);
    expect(view.state).toContainRemirrorDocument(p('hello ', mentionMark(label), ' friend'));
  });

  it('can split mentions', () => {
    const splitMention = mention({ id: '123', label: '@123', name: 'at' });

    add(doc(p(splitMention('@1<cursor>23'))));

    editor.insertText(' ');
    expect(view.state).toContainRemirrorDocument(
      p(mention({ id: '1', label: '@1', name: 'at' })('@1'), ' 23'),
    );
  });

  it('removes invalid mentions', () => {
    const splitMention = mention({ id: '123', label: '@123', name: 'at' });
    add(doc(p(splitMention('@<cursor>123')))).insertText(' ');

    expect(view.state).toContainRemirrorDocument(p('@ 123'));
  });

  it('decorates split mentions', () => {
    add(doc(p('hello <cursor>friend'))).insertText(`${label}`);

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        hello
        <a class="suggest suggest-at">
          @mentionfriend
        </a>
      </p>
    `);
  });

  it('injects the mention at the correct place', () => {
    add(doc(p('<cursor>'))).insertText(`This ${label} `);

    expect(view.state).toContainRemirrorDocument(p('This ', mentionMark(label), ' '));
    expect(change).toHaveBeenCalledTimes(id.length);
  });

  it('supports deleting content', () => {
    add(doc(p('<cursor>')))
      .insertText(`@1`)
      .dispatchCommand(({ state, dispatch }) => {
        if (dispatch) {
          dispatch(state.tr.delete(1, state.selection.head));
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
    hideConsoleError(true);

    it('replaces text at the current position by default', () => {
      add(doc(p('This is ', '<cursor>')));
      commands.createMention(attributes);

      expect(view.state).toContainRemirrorDocument(
        p('This is ', mention(attributes)(attributes.label)),
      );
    });

    it('replaces text at the specified position', () => {
      add(doc(p('This is ', '<cursor>')));
      commands.createMention({ ...attributes, range: { from: 1, to: 1, cursor: 1 } });

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
        // @ts-expect-error
        commands.createMention({ ...attributes, name: undefined }),
      ).toThrowErrorMatchingSnapshot();
    });
  });
});

describe('interactions with input rules', () => {
  const options: MentionOptions = {
    matchers: [{ char: '@', name: 'at', mentionClassName: 'custom' }],
  };

  const { add, doc, p, mention, view } = create(options);

  it('should skip input rules when mention active', () => {
    const mentionMark = mention({ id: 'mention', label: '@mention', name: 'at' });
    const { state } = add(doc(p('123 ', mentionMark('@men_tion<cursor>')))).insertText('_ ');

    expect(state.doc).toEqualRemirrorDocument(doc(p('123 ', mentionMark('@men_tion'), '_ ')));
  });

  it('should skip input rules when mention suggestion active', () => {
    add(doc(p('123 '))).insertText('@a_bc_ ');

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        123
        <a class="suggest suggest-at">
          @a_bc_
        </a>
      </p>
    `);
  });

  it('should skip input for overlapping sections', () => {
    add(doc(p('_123 '))).insertText('@abc_ ');

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        _123
        <a class="suggest suggest-at">
          @abc_
        </a>
      </p>
    `);
  });

  it('should support longer matches', () => {
    add(doc(p('123 '))).insertText('@a_bc_ this should be preserved');

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        123 @a_bc_ this should be preserved
      </p>
    `);
  });
});

describe('forwardDeletes', () => {
  const options: MentionOptions = {
    matchers: [{ char: '@', name: 'at', mentionClassName: 'custom' }],
  };

  const { add, doc, p, mention, view } = create(options);

  it('should support deleting forward', () => {
    const mentionMark = mention({ id: 'mention', label: '@mention', name: 'at' });
    add(doc(p('abc <cursor>', mentionMark('@mention')))).forwardDelete();

    expect(view.state.doc).toEqualRemirrorDocument(doc(p('abc mention')));
  });
});
