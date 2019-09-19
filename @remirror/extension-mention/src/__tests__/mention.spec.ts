import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import { MentionExtension, MentionExtensionOptions } from '../';
import { SuggestionCallbackParams } from '../mention-types';

describe('schema', () => {
  const { schema } = createBaseTestManager([{ extension: new MentionExtension(), priority: 1 }]);
  const attrs = { id: 'test', label: '@test' };

  const { mention, p, doc } = pmBuild(schema, {
    mention: { markType: 'mention', ...attrs },
  });

  it('creates the correct dom node', () => {
    expect(toHTML({ node: p(mention(attrs.label)), schema })).toBe(
      `<p><a class="mention mention-at" data-mention-id="${attrs.id}">${attrs.label}</a></p>`,
    );
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHTML({
      schema,
      content: `<a class="mention mention-at" data-mention-id="${attrs.id}">${attrs.label}</a>`,
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

const create = (params: MentionExtensionOptions = {}) =>
  renderEditor({
    attrMarks: [new MentionExtension({ mentionClassName: 'custom', ...params })],
  });

describe('plugin', () => {
  const options = {
    mentionClassName: 'custom',
    matchers: [{ char: '#', name: 'tag' }, { char: '@', name: 'at' }, { char: '+', name: 'plus' }],
  };

  const mocks = {
    onChange: jest.fn(),
    onExit: jest.fn(({ command }: SuggestionCallbackParams) => {
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
  let mentionMark = mention({ id, label });

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
    mentionMark = mention({ id, label });
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
    const splitMention = mention({ id: '123', label: '@123' });
    add(doc(p(splitMention('@1<cursor>23')))).insertText(` `);
    expect(view.state).toContainRemirrorDocument(p(mention({ id: '1', label: '@1' })('@1'), ' 23'));
  });

  it('removes invalid mentions', () => {
    const splitMention = mention({ id: '123', label: '@123' });
    add(doc(p(splitMention('@<cursor>123')))).insertText(` `);
    expect(view.state).toContainRemirrorDocument(p('@ 123'));
  });

  it('decorates split mentions', () => {
    add(doc(p('hello <cursor>friend'))).insertText(`${label}`);
    expect(view.dom).toContainHTML('<a class="suggestion suggestion-at">@mentionfriend</a>');
  });

  it('injects the mention at the correct place', () => {
    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p('This ', mentionMark(label), ' '));
    expect(mocks.onChange).toHaveBeenCalledTimes(id.length);
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
