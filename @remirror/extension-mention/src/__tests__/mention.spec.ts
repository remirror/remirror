import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@remirror/test-fixtures';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import { MentionExtension, MentionExtensionOptions } from '../';
import { SuggestCommandParams } from 'prosemirror-suggest';
import { MentionExtensionSuggestCommand } from '../mention-types';

describe('schema', () => {
  const { schema } = createBaseTestManager([{ extension: new MentionExtension(), priority: 1 }]);
  const attrs = { id: 'test', label: '@test', name: 'testing' };

  const { mention, p, doc } = pmBuild(schema, {
    mention: { markType: 'mention', ...attrs },
  });

  it('creates the correct dom node', () => {
    expect(toHTML({ node: p(mention(attrs.label)), schema })).toMatchInlineSnapshot(`
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
      content: `<a class="mention mention-at" data-mention-id="${attrs.id}" data-mention-name="${attrs.name}">${attrs.label}</a>`,
    });
    const expected = doc(p(mention(attrs.label)));
    expect(node).toEqualProsemirrorNode(expected);
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

  it('uses can be created with partial matchers', () => {
    const mentionOne = new MentionExtension({
      matchers: [{ char: '#', name: 'tag' }],
    });
    expect(mentionOne.options.matchers).toEqual([{ char: '#', name: 'tag' }]);
  });
});

const create = (params: MentionExtensionOptions) =>
  renderEditor({
    attrMarks: [new MentionExtension(params)],
  });

describe('plugin', () => {
  const options: MentionExtensionOptions = {
    matchers: [
      { char: '#', name: 'tag', mentionClassName: 'custom' },
      { char: '@', name: 'at', mentionClassName: 'custom' },
      { char: '+', name: 'plus', mentionClassName: 'custom' },
    ],
  };

  const mocks = {
    onChange: jest.fn(),
    onExit: jest.fn(({ command }: SuggestCommandParams<MentionExtensionSuggestCommand>) => {
      command({ appendText: '' });
    }),
  };

  const id = 'mention';
  const label = `@${id}`;

  let {
    add,
    nodes: { doc, p },
    attrMarks: { mention },
    view,
  } = create({
    ...options,
    ...mocks,
  });
  let mentionMark = mention({ id, label, name: 'at' });

  beforeEach(() => {
    ({
      add,
      nodes: { doc, p },
      attrMarks: { mention },
      view,
    } = create({
      ...options,
      ...mocks,
    }));
    mentionMark = mention({ id, label, name: 'at' });
  });

  it('uses default noop callbacks', () => {
    ({
      add,
      nodes: { doc, p },
      attrMarks: { mention },
      view,
    } = create(options));

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p(`This ${label} `));
  });

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
      .dispatchCommand((state, dispatch) => {
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
    matchers: [{ char: '#', name: 'tag' }, { char: '@', name: 'at' }, { char: '+', name: 'plus' }],
  };

  it('supports pasting content', () => {
    const {
      p,
      doc,
      attrMarks: { mention },
      add,
    } = create(options);
    add(doc(p('<cursor>')))
      .paste(p('This is text @hello'))
      .callback(content => {
        expect(content.state).toContainRemirrorDocument(
          p('This is text ', mention({ id: '@hello', name: 'at', label: '@hello' })('@hello')),
        );
      });
  });

  it('supports pasting multiple matchers', () => {
    const {
      p,
      doc,
      attrMarks: { mention },
      add,
    } = create(options);
    const at = mention({ id: '@hello', name: 'at', label: '@hello' })('@hello');
    const plus = mention({ id: '+awesome', name: 'plus', label: '+awesome' })('+awesome');
    const tag = mention({ id: '#12', name: 'tag', label: '#12' })('#12');
    add(doc(p('<cursor>')))
      .paste(p('#12 +awesome @hello'))
      .callback(content => {
        expect(content.state).toContainRemirrorDocument(p(tag, ' ', plus, ' ', at));
      });
  });
});

describe('commands', () => {
  const options = {
    matchers: [{ char: '#', name: 'tag' }, { char: '@', name: 'at' }, { char: '+', name: 'plus' }],
  };
  let {
    nodes: { doc, p },
    view,
    attrMarks: { mention },
    actions,
    add,
  } = create(options);

  const attrs = { id: 'test', label: '@test', name: 'at', appendText: '' };

  beforeEach(() => {
    ({
      nodes: { doc, p },
      view,
      attrMarks: { mention },
      actions,
      add,
    } = create(options));
  });

  describe('createMention', () => {
    it('replaces text at the current position by default', () => {
      add(doc(p('This is ', '<cursor>')));
      actions.createMention(attrs);

      expect(view.state).toContainRemirrorDocument(p('This is ', mention(attrs)(attrs.label)));
    });

    it('replaces text at the specified position', () => {
      add(doc(p('This is ', '<cursor>')));
      actions.createMention({ ...attrs, range: { from: 1, to: 1, end: 1 } });

      expect(view.state).toContainRemirrorDocument(p(mention(attrs)(attrs.label), 'This is '));
    });

    it('throws when invalid config passed into the command', () => {
      add(doc(p('This is ', '<cursor>')));

      expect(() => actions.createMention()).toThrowErrorMatchingInlineSnapshot(
        `"Invalid configuration attributes passed to the MentionExtension command."`,
      );
      expect(() => actions.createMention({})).toThrowErrorMatchingInlineSnapshot(
        `"Invalid configuration attributes passed to the MentionExtension command."`,
      );
      expect(() => actions.createMention({ ...attrs, id: '' })).toThrowErrorMatchingInlineSnapshot(
        `"Invalid configuration attributes passed to the MentionExtension command."`,
      );
      expect(() => actions.createMention({ ...attrs, label: '' })).toThrowErrorMatchingInlineSnapshot(
        `"Invalid configuration attributes passed to the MentionExtension command."`,
      );
      expect(() => actions.createMention({ ...attrs, name: 'invalid' })).toThrowErrorMatchingInlineSnapshot(
        `"The name 'invalid' specified for this command is invalid. Please choose from: [\\"tag\\",\\"at\\",\\"plus\\"]."`,
      );
      expect(() => actions.createMention({ ...attrs, name: undefined })).toThrowErrorMatchingInlineSnapshot(
        `"The MentionExtension command must specify a name since there are multiple matchers configured"`,
      );
    });
  });
});
