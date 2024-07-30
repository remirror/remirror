import { jest } from '@jest/globals';
import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import * as linkify from 'linkifyjs';
import {
  ApplySchemaAttributes,
  DecorationsExtension,
  extension,
  ExtensionTag,
  htmlToProsemirrorNode,
  NodeExtension,
  NodeExtensionSpec,
  prosemirrorNodeToHtml,
} from 'remirror';
import {
  BoldExtension,
  createCoreManager,
  EventsExtension,
  extractHref,
  LinkExtension,
  LinkOptions,
  OrderedListExtension,
  TOP_50_TLDS,
} from 'remirror/extensions';

import { FoundAutoLink } from '../src/link-extension';

extensionValidityTest(LinkExtension);

const href = 'https://test.com';

describe('schema', () => {
  let { schema } = createCoreManager([new LinkExtension()]);
  let { a, doc, p } = pmBuild(schema, {
    a: { markType: 'link', href },
  });

  beforeEach(() => {
    ({ schema } = createCoreManager([new LinkExtension()]));
    ({ a, doc, p } = pmBuild(schema, {
      a: { markType: 'link', href },
    }));
  });

  it('uses the href', () => {
    expect(prosemirrorNodeToHtml(p(a('link')))).toBe(
      `<p><a href="${href}" rel="noopener noreferrer nofollow">link</a></p>`,
    );
  });

  it('can parse content', () => {
    const node = htmlToProsemirrorNode({
      content: `<p><a href="${href}">link</a></p>`,
      schema,
    });
    const expected = doc(p(a('link')));

    expect(node).toEqualProsemirrorNode(expected);
  });

  describe('extraAttributes', () => {
    const custom = 'true';
    const title = 'awesome';

    const { schema } = createCoreManager([
      new LinkExtension({
        extraAttributes: {
          title: { default: null },
          custom: { default: 'failure', parseDOM: 'data-custom' },
        },
      }),
    ]);

    it('sets the extra attributes', () => {
      expect(schema.marks.link.spec.attrs).toEqual({
        href: {},
        target: { default: null },
        auto: { default: false },
        title: { default: null },
        custom: { default: 'failure' },
      });
    });

    it('does not override the href', () => {
      const { schema } = createCoreManager([
        new LinkExtension({
          extraAttributes: {
            title: { default: null },
            custom: { default: 'failure', parseDOM: 'data-custom' },
          },
        }),
      ]);

      expect(schema.marks.link.spec.attrs).toEqual({
        custom: { default: 'failure' },
        title: { default: null },
        href: {},
        target: { default: null },
        auto: { default: false },
      });
    });

    it('parses extra attributes', () => {
      const { a, doc, p } = pmBuild(schema, {
        a: { markType: 'link', href, custom, title },
      });

      const node = htmlToProsemirrorNode({
        content: `<p><a href="${href}" title="${title}" data-custom="${custom}">link</a></p>`,
        schema,
      });

      const expected = doc(p(a('link')));

      expect(node).toEqualProsemirrorNode(expected);
    });
  });
});

class NoMarkBlockExtension extends NodeExtension {
  get name() {
    return 'nomark' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      content: 'text*',
      marks: '',
      attrs: { ...extra.defaults() },
      toDOM: (node) => ['div', extra.dom(node), 0],
    };
  }
}

function create(options: LinkOptions = {}) {
  const linkExtension = new LinkExtension(options);

  if (options.onShortcut) {
    linkExtension.addHandler('onShortcut', options.onShortcut);
  }

  if (options.onClick) {
    linkExtension.addHandler('onClick', options.onClick);
  }

  if (options.onUpdateLink) {
    linkExtension.addHandler('onUpdateLink', options.onUpdateLink);
  }

  return renderEditor([
    new EventsExtension(),
    linkExtension,
    new BoldExtension(),
    new NoMarkBlockExtension(),
  ]);
}

describe('commands', () => {
  let onUpdateLink: any = jest.fn(() => {});
  let {
    add,
    attributeMarks: { link },
    nodes: { doc, p },
    commands,
    active,
    view,
  } = create({ onUpdateLink });

  beforeEach(() => {
    onUpdateLink = jest.fn(() => {});
    ({
      add,
      attributeMarks: { link },
      nodes: { doc, p },
      commands,
      active,
      view,
    } = create({ onUpdateLink }));
  });

  describe('.removeLink', () => {
    describe('()', () => {
      it('removes links when selection is wrapped', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        commands.removeLink();

        expect(view.state).toContainRemirrorDocument(p('Paragraph A link'));
      });

      it('removes the link cursor is within', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('A <cursor>link'))));
        commands.removeLink();

        expect(view.state).toContainRemirrorDocument(p('Paragraph A link'));
      });

      it('removes all links when selection contains multiples', () => {
        const testLink = link({ href });
        add(doc(p('<all>', testLink('1'), ' ', testLink('2'), ' ', testLink('3'))));
        commands.removeLink();

        expect(view.state).toContainRemirrorDocument(p('1 2 3'));
      });
    });

    describe('.enabled()', () => {
      it('is not enabled when not selected', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph<cursor> ', testLink('A link'))));

        expect(commands.removeLink.enabled()).toBeFalse();
      });

      it('is enabled with selection wrapped', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));

        expect(commands.removeLink.enabled()).toBeTrue();
      });

      it('is enabled with cursor within link', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('A <cursor>link'))));

        expect(commands.removeLink.enabled()).toBeTrue();
      });

      it('is enabled with selection of multiple nodes', () => {
        const testLink = link({ href });
        add(doc(p('<all>Paragraph ', testLink('A link'))));

        expect(commands.removeLink.enabled()).toBeTrue();
      });
    });
  });

  describe('updateLink', () => {
    describe('()', () => {
      it('creates a link for the selection', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph <start>A link<end>')));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(
          p('Paragraph ', testLink('<start>A link<end>')),
        );
      });

      it('calls the onUpdateLink handler when creating a link for the selection', () => {
        add(doc(p('Paragraph <start>A link<end>')));
        const attrs = { href };
        commands.updateLink(attrs);

        const { doc: document, selection } = view.state;
        expect(onUpdateLink).toHaveBeenCalledWith('A link', {
          doc: document,
          selection,
          attrs,
        });
      });

      it('does nothing for an empty selection', () => {
        add(doc(p('Paragraph <cursor>A link')));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(p('Paragraph A link'));
      });

      it('does not call the onUpdateLink handler on an empty selection', () => {
        add(doc(p('Paragraph <cursor>A link')));
        commands.updateLink({ href });

        expect(onUpdateLink).not.toHaveBeenCalled();
      });

      it('can update an existing link', () => {
        const testLink = link({ href });
        const attrs = { href: 'https://alt.com' };
        const altLink = link(attrs);
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        commands.updateLink(attrs);

        expect(view.state).toContainRemirrorDocument(
          p('Paragraph ', altLink('<start>A link<end>')),
        );
      });

      it('calls the onUpdateLink handler when updating an existing link', () => {
        const testLink = link({ href });
        const attrs = { href: 'https://alt.com' };
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        commands.updateLink(attrs);

        const { doc: document, selection } = view.state;
        expect(onUpdateLink).toHaveBeenCalledWith('A link', {
          doc: document,
          selection,
          attrs,
        });
      });

      it('overwrites multiple existing links', () => {
        const testLink = link({ href });
        add(doc(p('<all>', testLink('1'), ' ', testLink('2'), ' ', testLink('3'))));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(p(testLink('1 2 3')));
      });

      it('calls the onUpdateLink handler when overwriting multiple existing links', () => {
        const attrs = { href };
        const testLink = link(attrs);
        add(doc(p('<all>', testLink('1'), ' ', testLink('2'), ' ', testLink('3'))));
        commands.updateLink({ href });

        const { doc: document, selection } = view.state;
        expect(onUpdateLink).toHaveBeenCalledWith('1 2 3', {
          doc: document,
          selection,
          attrs,
        });
      });

      it('can select all and create a link', () => {
        const testLink = link({ href });
        add(doc(p('<all>', '1', ' ', '2', ' ', '3')));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(p(testLink('1 2 3')));
      });

      it('calls the onUpdateLink handler when selecting all and creating a link', () => {
        const attrs = { href };
        add(doc(p('<all>', '1', ' ', '2', ' ', '3')));
        commands.updateLink({ href });

        const { doc: document, selection } = view.state;
        expect(onUpdateLink).toHaveBeenCalledWith('1 2 3', {
          doc: document,
          selection,
          attrs,
        });
      });
    });

    describe('.enabled()', () => {
      it('is enabled when text is selected', () => {
        add(doc(p('Paragraph <start>A<end> link')));

        expect(commands.updateLink.enabled({ href: '' })).toBeTrue();
      });

      it('is not enabled for empty selections', () => {
        add(doc(p('Paragraph <cursor>A link')));

        expect(commands.updateLink.enabled({ href: '' })).toBeFalse();
      });

      it('is not enabled for node selections', () => {
        add(doc(p('Paragraph <node>A link')));

        expect(commands.updateLink.enabled({ href: '' })).toBeFalse();
      });

      it('is not enabled for nodes that are not applicable', () => {
        @extension({ disableExtraAttributes: true })
        class NoMarksExtension extends NodeExtension {
          get name() {
            return 'noMarks' as const;
          }

          createTags() {
            return [ExtensionTag.Block];
          }

          createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
            return {
              content: 'inline*',
              marks: '',
              parseDOM: [
                {
                  tag: 'div',
                  getAttrs: (node) => ({
                    ...extra.parse(node),
                  }),
                },
              ],

              toDOM: (node) => {
                return ['div', extra.dom(node), 0];
              },
            };
          }
        }

        const { add, nodes, commands } = renderEditor([
          new LinkExtension(),
          new NoMarksExtension(),
        ]);
        const { doc, noMarks } = nodes;

        add(doc(noMarks('No marks <start>A<end> link')));

        expect(commands.updateLink.enabled({ href: '' })).toBeFalse();
      });
    });
  });

  describe('active()', () => {
    it('is not active when not selected', () => {
      const testLink = link({ href });
      add(doc(p('Paragraph<cursor> ', testLink('A link'))));

      expect(active.link()).toBeFalse();
    });

    it('is active with selection wrapped', () => {
      const testLink = link({ href });
      add(doc(p('Paragraph ', testLink('<start>A link<end>'))));

      expect(active.link()).toBeTrue();
    });

    it('is active with cursor within link', () => {
      const testLink = link({ href });
      add(doc(p('Paragraph ', testLink('A <cursor>link'))));

      expect(active.link()).toBeTrue();
    });

    it('is active with selection of multiple nodes', () => {
      const testLink = link({ href });
      add(doc(p('<all>Paragraph ', testLink('A link'))));

      expect(active.link()).toBeTrue();
    });
  });
});

describe('keys', () => {
  const onShortcut: any = jest.fn(() => {});

  it('responds to Mod-k', () => {
    const {
      add,
      nodes: { doc, p },
    } = create({ onShortcut });

    add(doc(p(`<cursor>Link`)))
      .shortcut('Mod-k')
      .callback(() => {
        expect(onShortcut).toHaveBeenCalledWith(
          expect.objectContaining({ from: 1, to: 5, selectedText: 'Link' }),
        );
      });
  });

  it('does not call handler when no nearby word', () => {
    const {
      add,
      nodes: { doc, p },
    } = create({ onShortcut });

    add(doc(p(`<cursor> Link`)))
      .shortcut('Mod-k')
      .callback(({ from, to }) => {
        expect({ from, to }).toEqual({ from: 1, to: 1 });
        expect(onShortcut).not.toHaveBeenCalled();
      });
  });
});

describe('autolinking', () => {
  let onUpdateLink: any = jest.fn(() => {});
  let editor = create({ autoLink: true, onUpdateLink });
  let { link } = editor.attributeMarks;
  let { doc, p, nomark } = editor.nodes;
  let { bold } = editor.marks;

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(1);
      return 1;
    });

    onUpdateLink = jest.fn(() => {});

    editor = create({ autoLink: true, onUpdateLink });
    ({
      attributeMarks: { link },
      nodes: { doc, p, nomark },
      marks: { bold },
    } = editor);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('can auto link', () => {
    editor.add(doc(p('<cursor>'))).insertText('test.co');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.co' })('test.co'))),
    );

    editor.insertText('m');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.com' })('test.com'))),
    );

    editor.insertText(' test.com test.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: '//test.com' })('test.com'),
        ),
      ),
    );
  });

  it('can parse telephone by overriding extractHref', () => {
    const phoneRegex = /(?:\+?(\d{1,3}))?[(.-]*(\d{3})[).-]*(\d{3})[.-]*(\d{4})(?: *x(\d+))?/;
    const linkRegex =
      /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}\.?(?::\d{2,5})?(?:[#/?]\S*)?/gi;

    const composedRegex = new RegExp(
      [phoneRegex, linkRegex].map((regex) => `(${regex.source})`).join('|'),
      'gi',
    );

    const extractLinkOrTel = (props: { url: string; defaultProtocol: string }): string => {
      linkRegex.lastIndex = 0;
      const isLink = linkRegex.test(props.url);
      return isLink ? extractHref(props) : `tel:${props.url}`;
    };

    const editor = create({
      autoLink: true,
      autoLinkRegex: composedRegex,
      extractHref: extractLinkOrTel,
    });
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>'))).insertText('test.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.com' })('test.com'))),
    );

    editor.insertText(' test.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: '//test.com' })('test.com'),
        ),
      ),
    );

    editor.insertText(' 800-555-1234');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: 'tel:800-555-1234' })('800-555-1234'),
        ),
      ),
    );

    editor.insertText(' 800-555-0000');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: 'tel:800-555-1234' })('800-555-1234'),
          ' ',
          link({ auto: true, href: 'tel:800-555-0000' })('800-555-0000'),
        ),
      ),
    );
  });

  it('calls the onUpdateLink handler when auto linking', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((requestCallback) => {
      requestCallback(1);
      return 1;
    });
    let editorText = 'test.co';
    editor.add(doc(p('<cursor>'))).insertText(editorText);

    expect(onUpdateLink).toHaveBeenCalledWith(editorText, {
      doc: editor.doc,
      selection: editor.view.state.selection,
      range: {
        from: 1,
        to: editorText.length + 1,
      },
      attrs: { auto: true, href: '//test.co' },
    });

    editorText += 'm';
    editor.insertText('m');

    expect(onUpdateLink).toHaveBeenCalledWith(editorText, {
      doc: editor.doc,
      selection: editor.view.state.selection,
      range: {
        from: 1,
        to: editorText.length + 1,
      },
      attrs: { auto: true, href: '//test.com' },
    });
  });

  it('should not autolink or call onUpdateLink by default', () => {
    const editor = create({ onUpdateLink });
    const { doc, p } = editor.nodes;

    editor.add(doc(p('<cursor>'))).insertText('test.co');
    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.co')));

    editor.insertText(' https://test.com ');
    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.co https://test.com ')));

    expect(onUpdateLink).not.toHaveBeenCalled();
  });

  it('should not autolink or call onUpdateLink when mark is not allowed', () => {
    editor.add(doc(nomark('<cursor>'))).insertText('test.co');
    expect(editor.doc).toEqualRemirrorDocument(doc(nomark('test.co')));

    editor.insertText(' https://test.com ');
    expect(editor.doc).toEqualRemirrorDocument(doc(nomark('test.co https://test.com ')));

    expect(onUpdateLink).not.toHaveBeenCalled();
  });

  it('updates the autolink on each change', () => {
    editor
      .add(doc(p('<cursor>')))
      .insertText('test.com')
      .selectText(8)
      .insertText(' roo');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.co' })('test.co'), ' room')),
    );
  });

  it('updates the autolink if modified in the middle', () => {
    editor
      .add(doc(p('<cursor>')))
      .insertText('github.com')
      .selectText(7)
      .insertText('status');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//githubstatus.com' })('githubstatus.com'))),
    );
  });

  it('should create auto link if href equals text content', () => {
    const editor = renderEditor([new LinkExtension({ autoLink: true })]);
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor.chain.insertHtml('<a href="//test.com">test.com</a>').run();

    editor.selectText(5).insertText('er');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//tester.com' })('tester.com'))),
    );
  });

  it('should not create auto link if href does not equal text content', () => {
    const editor = renderEditor([new LinkExtension({ autoLink: true })]);
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor.chain.insertHtml('<a href="//test.com">test</a>').run();

    editor.selectText(5).insertText('er');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: false, href: '//test.com' })('test'), 'er')),
    );
  });

  it('detects separating two links by entering a space', () => {
    editor.add(doc(p('github.com<cursor>remirror.io')));

    expect(editor.doc).toEqualRemirrorDocument(doc(p('github.com<cursor>remirror.io')));

    editor.insertText(' ');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//github.com' })('github.com'),
          ' ',
          link({ auto: true, href: '//remirror.io' })('remirror.io'),
        ),
      ),
    );
  });

  it('detects separating two links by `Enter` key press', () => {
    editor
      .add(doc(p(link({ auto: true, href: '//test.coremirror.io' })('test.co<cursor>remirror.io'))))
      .press('Enter');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(link({ auto: true, href: '//test.co' })('test.co')),
        p(link({ auto: true, href: '//remirror.io' })('remirror.io')),
      ),
    );
  });

  it('supports deleting selected forward to invalidate the match', () => {
    editor
      .add(doc(p('<cursor>')))
      .insertText('test.com')
      .selectText({ head: 7, anchor: 9 })
      .forwardDelete();

    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.c')));
  });

  it('supports backspace deletes to invalidate the match', () => {
    editor
      .add(doc(p('<cursor>')))
      .insertText('test.com')
      .backspace(2);

    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.c')));
  });

  it('supports backspace to create a match', () => {
    editor.add(doc(p('test. <cursor>com'))).backspace();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.com' })('test.com'))),
    );
  });

  it('should only update first link', () => {
    editor.add(
      doc(
        p(
          link({ auto: true, href: '//first.co' })('first.co<cursor>'),
          ' ',
          link({ auto: true, href: '//second.com' })('second.com'),
        ),
      ),
    );

    editor.insertText('m');

    expect(onUpdateLink).toHaveBeenCalledOnce();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//first.com' })('first.com'),
          ' ',
          link({ auto: true, href: '//second.com' })('second.com'),
        ),
      ),
    );
  });

  it('should only update second link', () => {
    editor.add(
      doc(
        p(
          link({ auto: true, href: '//first.co' })('first.co'),
          ' ',
          link({ auto: true, href: '//second.com' })('second.com'),
        ),
      ),
    );

    editor.backspace();

    expect(onUpdateLink).toHaveBeenCalledOnce();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//first.co' })('first.co'),
          ' ',
          link({ auto: true, href: '//second.co' })('second.co'),
        ),
      ),
    );
  });

  it('should update second link once after stepping out of link node', () => {
    editor.add(
      doc(
        p(
          link({ auto: true, href: '//first.co' })('first.co'),
          ' ',
          link({ auto: true, href: '//second.com' })('second.com'),
        ),
      ),
    );

    editor.backspace();

    expect(onUpdateLink).toHaveBeenCalledOnce();

    editor.insertText(' ');

    expect(onUpdateLink).toHaveBeenCalledOnce();

    editor.insertText('Test');

    expect(onUpdateLink).toHaveBeenCalledOnce();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//first.co' })('first.co'),
          ' ',
          link({ auto: true, href: '//second.co' })('second.co'),
          ' Test',
        ),
      ),
    );
  });

  it('supports detecting changed TLD in quotes', () => {
    editor.add(doc(p('"test.co<cursor>"')));

    expect(editor.doc).toEqualRemirrorDocument(doc(p('"test.co"')));

    editor.insertText('m');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('"', link({ auto: true, href: '//test.com' })('test.com'), '"')),
    );
  });

  it('supports detecting removing and creating links inside string', () => {
    editor.add(doc(p('Test"test.co<cursor>"Test')));

    expect(editor.doc).toEqualRemirrorDocument(doc(p('Test"test.co"Test')));

    editor.backspace(2).insertText('io');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('Test"', link({ auto: true, href: '//test.io' })('test.io'), '"Test')),
    );
  });

  it('supports detecting added adjacent text nodes', () => {
    editor.add(doc(p('window.com')));

    expect(editor.doc).toEqualRemirrorDocument(doc(p('window.com')));

    editor.backspace();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//window.co' })('window.co'))),
    );

    editor.insertText('nfirm');

    expect(editor.doc).toEqualRemirrorDocument(doc(p('window.confirm')));
  });

  it('supports detecting removed adjacent text nodes', () => {
    editor.add(doc(p('window.confirm')));

    expect(editor.doc).toEqualRemirrorDocument(doc(p('window.confirm')));

    editor.backspace(5);

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//window.co' })('window.co'))),
    );
  });

  it('can respond to inserted space separating the link', () => {
    editor.add(doc(p('test.co/is<cursor>testing'))).insertText(' ');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.co/is' })('test.co/is'), ' testing')),
    );
  });

  it('responds to joining text', () => {
    editor.add(
      doc(p(link({ auto: true, href: '//test.co/is' })('test.co/is'), ' <cursor>testing')),
    );

    editor.backspace();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.co/istesting' })('test.co/istesting'))),
    );
  });

  it('can respond to `Enter` key presses', () => {
    editor
      .add(doc(p('<cursor>')))
      .insertText('test.cool')
      .selectText(8)
      .press('Enter')
      .insertText('co');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.co' })('test.co')), p('cool')),
    );
  });

  it('can respond to `Enter` key presses with only one letter', () => {
    editor
      .add(doc(p('<cursor>')))
      .insertText('test.coo')
      .selectText(8)
      .press('Enter')
      .insertText('co');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.co' })('test.co')), p('coo')),
    );
  });

  it('does not replace an active link with an automatic link', () => {
    editor
      .add(doc(p('Hi ', link({ auto: false, href: '//test.com' })('test.com'), '<cursor>')))
      .insertText(' ');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('Hi ', link({ auto: false, href: '//test.com' })('test.com'), ' ')),
    );
  });

  it('does not override a non automatic link', () => {
    editor.add(doc(p('<cursor>', link({ href: '//test.com' })('test.com')))).insertText('no');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('no', link({ href: '//test.com' })('test.com'))),
    );
  });

  it('does not override a non automatic link in the position ahead', () => {
    editor
      .add(doc(p('<cursor> ', link({ href: '//test.com' })('test.com'))))
      .insertText('a')
      .selectText(3);

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('a ', link({ href: '//test.com' })('test.com'))),
    );
  });

  it('does not remove other links in the same parent node', () => {
    editor
      .add(
        doc(
          p(
            link({ auto: true, href: '//remirror.io' })('remirror.io'),
            '<cursor> ',
            link({ href: '//test.com' })('test.com'),
          ),
        ),
      )
      .backspace();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('remirror.i ', link({ href: '//test.com' })('test.com'))),
    );
  });

  it('does not remove other auto links in the same parent node', () => {
    editor
      .add(
        doc(
          p(
            link({ auto: true, href: '//remirror.io' })('remirror.io'),
            '<cursor> ',
            link({ auto: true, href: '//test.com' })('test.com'),
          ),
        ),
      )
      .backspace();

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('remirror.i ', link({ auto: true, href: '//test.com' })('test.com'))),
    );
  });

  it('does not create a link if not in selection range - edit text after', () => {
    editor.add(doc(p('remirror.io tester'))).backspace(2);

    expect(editor.doc).toEqualRemirrorDocument(doc(p('remirror.io', ' test')));
  });

  it('does not create a link if not in selection range - edit text before', () => {
    editor
      .add(doc(p('tester remirror.io')))
      .selectText(7)
      .backspace(2);

    expect(editor.doc).toEqualRemirrorDocument(doc(p('test', ' remirror.io')));
  });

  it('does not create a link if not in selection range - create link after', () => {
    editor
      .add(doc(p('remirror.io test ')))
      .backspace()
      .insertText('.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('remirror.io ', link({ auto: true, href: '//test.com' })('test.com'))),
    );
  });

  it('does not create a link if not in selection range - create link before', () => {
    editor
      .add(doc(p('test remirror.io')))
      .selectText(5)
      .insertText('.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//test.com' })('test.com'), ' remirror.io')),
    );
  });

  it('should create links with the same URL without a space between links', () => {
    editor.add(doc(p('test"'))).insertText('test.com"test.com"test');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          'test"',
          link({ auto: true, href: '//test.com' })('test.com'),
          '"',
          link({ auto: true, href: '//test.com' })('test.com'),
          '"test',
        ),
      ),
    );
  });

  it('should create links with different URLs without a space between links', () => {
    editor.add(doc(p('test"'))).insertText('tester.com"test.com"test');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          'test"',
          link({ auto: true, href: '//tester.com' })('tester.com'),
          '"',
          link({ auto: true, href: '//test.com' })('test.com'),
          '"test',
        ),
      ),
    );
  });

  it('should only update edited link when multiple links are not separated by a space - first link', () => {
    editor
      .add(doc(p('test"test.com"remirror.io"test')))
      .selectText(14)
      .backspace(2);

    expect(editor.doc).toEqualRemirrorDocument(doc(p('test"test.c"remirror.io"test')));

    editor.insertText('om');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('test"', link({ auto: true, href: '//test.com' })('test.com'), '"remirror.io"test')),
    );

    editor.backspace(2);

    expect(editor.doc).toEqualRemirrorDocument(doc(p('test"test.c"remirror.io"test')));
  });

  it('allows creating identical links in different parent nodes', () => {
    editor
      .add(doc(p(link({ auto: true, href: '//test.com' })('test.com'))))
      .press('Enter')
      .insertText('test.com test.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(link({ auto: true, href: '//test.com' })('test.com')),
        p(
          link({ auto: true, href: '//test.com' })('test.com'),
          ' ',
          link({ auto: true, href: '//test.com' })('test.com'),
        ),
      ),
    );
  });

  it('detects emails as auto link', () => {
    editor.add(doc(p('<cursor>'))).insertText('user@example.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: 'mailto:user@example.com' })('user@example.com'))),
    );
  });

  it('works with other input rules', () => {
    editor.add(doc(p('__bold_<cursor>'))).insertText('_');

    expect(editor.doc).toEqualRemirrorDocument(doc(p(bold('bold'))));
  });

  it('does not interfere with input rules for ordered lists', () => {
    const editor = renderEditor([
      new LinkExtension({ autoLink: true }),
      new OrderedListExtension(),
    ]);
    const { doc, p, orderedList: ol, listItem: li } = editor.nodes;

    editor.add(doc(p('<cursor>Hello there friend and partner.'))).insertText('1.');

    expect(editor.doc).toEqualRemirrorDocument(doc(p('1.Hello there friend and partner.')));

    editor.insertText(' ');

    expect(editor.doc).toEqualRemirrorDocument(doc(ol(li(p('Hello there friend and partner.')))));
  });
});

describe('more auto link cases', () => {
  let editor = create({ autoLink: true });
  let { link } = editor.attributeMarks;
  let { doc, p } = editor.nodes;

  beforeEach(() => {
    editor = create({ autoLink: true });
    ({
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor);
  });

  it.each([
    { input: 'google.com', expected: '//google.com' },
    { input: 'www.google.com', expected: '//www.google.com' },
    { input: 'http://github.com' },
    { input: 'https://github.com/remirror/remirror' },

    // with port
    { input: 'time.google.com:123', expected: '//time.google.com:123' },

    // with "#"
    { input: "https://en.wikipedia.org/wiki/The_Power_of_the_Powerless#Havel's_greengrocer" },

    // with '(' and ')'
    { input: 'https://en.wikipedia.org/wiki/Specials_(Unicode_block)' },

    {
      input: 'en.wikipedia.org/wiki/Specials_(Unicode_block)',
      expected: '//en.wikipedia.org/wiki/Specials_(Unicode_block)',
    },

    // with "?"
    { input: 'https://www.google.com/search?q=test' },

    // with everything
    {
      input:
        'https://github.com:443/remirror/remirror/commits/main?after=4dc93317d4b62f2d155865f7d2e721f05ddfdd61+34&branch=main&path%5B%5D=readme.md#repo-content-pjax-container',
    },
  ])('can auto link $input', ({ input, expected }) => {
    editor.add(doc(p('<cursor>'))).insertText(input);

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: expected ?? input })(input))),
    );
  });
});

describe('autolinking with allowed TLDs', () => {
  const autoLinkAllowedTLDs = ['com', 'net'];
  let editor = create({ autoLink: true, autoLinkAllowedTLDs });
  let { link } = editor.attributeMarks;
  let { doc, p } = editor.nodes;

  beforeEach(() => {
    editor = create({ autoLink: true, autoLinkAllowedTLDs });
    ({
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor);
  });

  it('detects domains as auto link if the TLD is allowed', () => {
    editor.add(doc(p('github<cursor>'))).insertText('.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//github.com' })('github.com'))),
    );
  });

  it('detects domains as auto link if the TLD is allowed (.net)', () => {
    editor.add(doc(p('docusign<cursor>'))).insertText('.net');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//docusign.net' })('docusign.net'))),
    );
  });

  it('detects URLs without protocol as auto links if the TLD is allowed', () => {
    editor.add(doc(p('<cursor>'))).insertText('github.com/remirror/remirror');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: '//github.com/remirror/remirror' })(
            'github.com/remirror/remirror',
          ),
        ),
      ),
    );
  });

  it('detects URLs with protocol as auto links if the TLD is allowed', () => {
    editor.add(doc(p('<cursor>'))).insertText('https://github.com/remirror/remirror');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(
        p(
          link({ auto: true, href: 'https://github.com/remirror/remirror' })(
            'https://github.com/remirror/remirror',
          ),
        ),
      ),
    );
  });

  it('does NOT detect domains as auto link if the TLD is not allowed', () => {
    editor.add(doc(p('remirror<cursor>'))).insertText('.io');

    expect(editor.doc).toEqualRemirrorDocument(doc(p('remirror.io')));
  });

  it('does NOT detect URLs as auto link if the TLD is not allowed', () => {
    editor.add(doc(p('<cursor>'))).insertText('https://en.wikipedia.org/wiki/TypeScript');

    expect(editor.doc).toEqualRemirrorDocument(doc(p('https://en.wikipedia.org/wiki/TypeScript')));
  });

  it('detects only the TLD, not other parts of the URL', () => {
    editor.add(doc(p('npmjs<cursor>'))).insertText('.org/package/asp.net');

    expect(editor.doc).toEqualRemirrorDocument(doc(p('npmjs.org/package/asp.net')));
  });

  it('detects emails as auto link if the TLD is allowed', () => {
    editor.add(doc(p('user@example<cursor>'))).insertText('.com');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: 'mailto:user@example.com' })('user@example.com'))),
    );
  });

  it('does NOT detect emails as auto link if the TLD is not allowed', () => {
    editor.add(doc(p('user@example<cursor>'))).insertText('.org');

    expect(editor.doc).toEqualRemirrorDocument(doc(p('user@example.org')));
  });

  it('can extend the default list with additional items', () => {
    expect(TOP_50_TLDS).not.toInclude('london');

    const editor = renderEditor([
      new LinkExtension({ autoLink: true, autoLinkAllowedTLDs: [...TOP_50_TLDS, 'london'] }),
    ]);
    const {
      add,
      nodes: { doc, p },
      attributeMarks: { link },
    } = editor;

    add(doc(p('business<cursor>'))).insertText('.london');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//business.london' })('business.london'))),
    );
  });
});

describe('events handler', () => {
  it('clickHandler selects the full text of the link when clicked', () => {
    const {
      add,
      attributeMarks: { link },
      nodes: { doc, p },
      view,
    } = create({ selectTextOnClick: true });
    const linkMark = link({ href: '//test.com' })('test.com');
    const node = p('first ', linkMark);
    add(doc(node));
    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {} as MouseEvent, false));

    expect(view.state.selection.empty).toBeFalse();
    expect({ from: view.state.selection.from, to: view.state.selection.to }).toEqual({
      from: 7,
      to: 15,
    });
  });

  it('clickHandler opens link when clicked', () => {
    const {
      add,
      attributeMarks: { link },
      nodes: { doc, p },
      view,
    } = create({ openLinkOnClick: true });

    jest.spyOn(global, 'open').mockImplementation(() => {
      return null;
    });

    const linkMark = link({ href: '//test.com' })('test.com');
    const node = p('first ', linkMark);
    add(doc(node));
    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {} as MouseEvent, false));
    expect(global.open).toHaveBeenCalled();
  });
});

describe('onClick', () => {
  it('responds to clicks', () => {
    const onClick: any = jest.fn(() => false);
    const {
      view,
      add,
      attributeMarks: { link },
      nodes: { doc, p },
    } = create({ autoLink: true, onClick });

    const linkMark = link({ href: '//test.com' })('test.com');
    const node = p('first ', linkMark);
    add(doc(node));

    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {} as MouseEvent, false));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        from: 7,
        to: 15,
        text: 'test.com',
        mark: expect.any(Object),
      }),
    );

    view.someProp('handleClick', (fn) => fn(view, 3, {} as MouseEvent));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('can override further options when false is returned', () => {
    let returnValue = true;
    const onClick: any = jest.fn(() => returnValue);
    const {
      view,
      add,
      attributeMarks: { link },
      nodes: { doc, p },
    } = create({ autoLink: true, onClick, selectTextOnClick: true });

    const linkMark = link({ href: '//test.com' })('test.com');
    const node = p('first ', linkMark);
    add(doc(node));

    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {} as MouseEvent, false));
    // It doesn't select the text when the callback returns true.
    expect(view.state.selection.empty).toBeTrue();

    returnValue = false;

    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {} as MouseEvent, false));
    // It selects the text when the callback returns true.
    expect(view.state.selection.empty).toBeFalse();
  });
});

describe('spanning', () => {
  it('should allow selection of part of link without splitting it', () => {
    const {
      add,
      attributeMarks: { link },
      nodes: { doc, p },
      view,
    } = renderEditor<LinkExtension | DecorationsExtension>([
      new LinkExtension(),
      new DecorationsExtension({ persistentSelectionClass: 'selection' }),
    ]);

    const linkMark = link({ href: '//test.com' })('a <start>long<end> link');
    add(doc(p('Paragraph with ', linkMark, ' and text')));

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Paragraph with
        <a
          href="//test.com"
          rel="noopener noreferrer nofollow"
        >
          a
          <span class="selection">
            long
          </span>
          link
        </a>
        and text
      </p>
    `);
  });
});

describe('target', () => {
  it('should allow `supportedTargets`', () => {
    const editor = renderEditor([new LinkExtension({ supportedTargets: ['_blank'] })]);
    const {
      attributeMarks: { link: a },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>')));
    editor.chain
      .insertHtml('<a href="//test.com" target="_blank">test</a>')
      .selectText('end')
      .run();
    const link = a({ href: '//test.com', target: '_blank' });
    // editor.debug();
    expect(editor.doc).toEqualRemirrorDocument(doc(p(link('test'))));
  });

  it('should not allow non `supportedTargets`', () => {
    const editor = renderEditor([new LinkExtension({ supportedTargets: ['_blank'] })]);
    const {
      attributeMarks: { link: a },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>')));
    editor.chain
      .insertHtml('<a href="//test.com" target="_parent">test</a>')
      .selectText('end')
      .run();
    const link = a({ href: '//test.com' });
    expect(editor.doc).toEqualRemirrorDocument(doc(p(link('test'))));
  });

  it('should add `defaultTarget` to supported targets', () => {
    const editor = renderEditor([new LinkExtension({ defaultTarget: '_blank' })]);
    const {
      attributeMarks: { link: a },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>')));
    editor.chain
      .insertHtml('<a href="//test.com" target="_blank">test</a>')
      .selectText('end')
      .run();
    const link = a({ href: '//test.com', target: '_blank' });
    expect(editor.doc).toEqualRemirrorDocument(doc(p(link('test'))));
  });
});

describe('adjacent punctuations', () => {
  it('should not remove link if "." is added before link', () => {
    const editor = renderEditor([
      new LinkExtension({
        autoLink: true,
      }),
    ]);
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor
      .add(doc(p('<cursor>')))
      .insertText('remirror.io')
      .selectText(0)
      .insertText('.');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('.', link({ auto: true, href: '//remirror.io' })('remirror.io'))),
    );
  });

  it('should not include surrounding `"` in the link', () => {
    const editor = renderEditor([
      new LinkExtension({
        autoLink: true,
      }),
    ]);
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>'))).insertText('"remirror.io"');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('"', link({ auto: true, href: '//remirror.io' })('remirror.io'), '"')),
    );
  });

  it('should not include surrounding `((("")))` in the link', () => {
    const editor = renderEditor([
      new LinkExtension({
        autoLink: true,
      }),
    ]);
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>'))).insertText('((("remirror.io")))');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p('((("', link({ auto: true, href: '//remirror.io' })('remirror.io'), '")))')),
    );
  });

  it('should not include trailing `"` in the link', () => {
    const editor = renderEditor([
      new LinkExtension({
        autoLink: true,
      }),
    ]);
    const {
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor;

    editor.add(doc(p('<cursor>'))).insertText('remirror.io"');

    expect(editor.doc).toEqualRemirrorDocument(
      doc(p(link({ auto: true, href: '//remirror.io' })('remirror.io'), '"')),
    );
  });

  describe('URL Path', () => {
    it('should allow a path that is not balanced', () => {
      const editor = renderEditor([
        new LinkExtension({
          autoLink: true,
        }),
      ]);
      const {
        attributeMarks: { link },
        nodes: { doc, p },
      } = editor;

      editor
        .add(doc(p('<cursor>')))
        .insertText('remirror.io?test=(balance)')
        .backspace();

      expect(editor.doc).toEqualRemirrorDocument(
        doc(
          p(link({ auto: true, href: '//remirror.io?test=(balance' })('remirror.io?test=(balance')),
        ),
      );
    });

    describe('linkify', () => {
      const findAutoLinks = (str: string): FoundAutoLink[] =>
        linkify.find(str).map((link) => ({
          text: link.value,
          href: link.href,
          start: link.start,
          end: link.end,
        }));

      const isValidUrl = (input: string) => linkify.test(input);

      it('should allow a path that is not balanced', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor
          .add(doc(p('<cursor>')))
          .insertText('remirror.io/?test=(balance)')
          .backspace();

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(
              link({ auto: true, href: 'http://remirror.io/?test=(balance' })(
                'remirror.io/?test=(balance',
              ),
            ),
          ),
        );
      });

      it('should not include surrounding `((("")))` in the link', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('((("remirror.io/test")))');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(
              '((("',
              link({ auto: true, href: 'http://remirror.io/test' })('remirror.io/test'),
              '")))',
            ),
          ),
        );
      });

      it('should not include surrounding `,` in the link', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText(',remirror.io/test,');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(',', link({ auto: true, href: 'http://remirror.io/test' })('remirror.io/test'), ','),
          ),
        );
      });

      it('should not include trailing `?` in the link', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('remirror.io/?test=true');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(
              link({ auto: true, href: 'http://remirror.io/?test=true' })('remirror.io/?test=true'),
            ),
          ),
        );

        editor.selectText(23).backspace(10).insertText('?');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(p(link({ auto: true, href: 'http://remirror.io/' })('remirror.io/'), '?')),
        );
      });

      it('should not include trailing `"` in the link', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('remirror.io/test"');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(p(link({ auto: true, href: 'http://remirror.io/test' })('remirror.io/test'), '"')),
        );
      });

      it('should not include trailing `"""` in the link', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('remirror.io/test"""');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(p(link({ auto: true, href: 'http://remirror.io/test' })('remirror.io/test'), '"""')),
        );
      });

      it('should handle unbalanced path', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor
          .add(doc(p('<cursor>')))
          .insertText('remirror.io/test(balance))')
          .backspace(2);

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(
              link({ auto: true, href: 'http://remirror.io/test(balance' })(
                'remirror.io/test(balance',
              ),
            ),
          ),
        );
      });

      it('should check for balanced brackets', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('remirror.io/test(balance))');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(
              link({ auto: true, href: 'http://remirror.io/test(balance)' })(
                'remirror.io/test(balance)',
              ),
              ')',
            ),
          ),
        );
      });

      it('should exclude ")" and following punctuation after balanced path', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('remirror.io/?test=(balance))"');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(
              link({ auto: true, href: 'http://remirror.io/?test=(balance)' })(
                'remirror.io/?test=(balance)',
              ),
              ')"',
            ),
          ),
        );
      });

      it('detects email and excludes surrounding parentheses', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            findAutoLinks,
            isValidUrl,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor.add(doc(p('<cursor>'))).insertText('(user@exmaple.com)');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p('(', link({ auto: true, href: 'mailto:user@exmaple.com' })('user@exmaple.com'), ')'),
          ),
        );
      });
    });

    describe('regex supporting balanced brackets', () => {
      const autoLinkRegex =
        /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)*(?:(?:\d(?!\.)|[a-z\u00A1-\uFFFF])(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}(?::\d{2,5})?(?:[#/?](?:(?! |[!"'(),.;?[\]{}-]).|-+|\((?:(?![ )]).)*\)|\[(?:(?![ \]]).)*]|'(?=\w)|\.(?! |\.|$)|,(?! |,|$)|;(?! |;|$)|!(?! |!|$)|\?(?! |\?|$))+|\/)?/gi;

      it('should not allow a path that is not balanced', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            autoLinkRegex,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor
          .add(doc(p('<cursor>')))
          .insertText('remirror.io?test=(balance)')
          .backspace();

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(link({ auto: true, href: '//remirror.io?test=' })('remirror.io?test='), '(balance'),
          ),
        );
      });

      it('detects separating two links by `Enter` key press and unlinks invalid characters', () => {
        const editor = renderEditor([
          new LinkExtension({
            autoLink: true,
            autoLinkRegex,
          }),
        ]);
        const {
          attributeMarks: { link },
          nodes: { doc, p },
        } = editor;

        editor
          .add(
            doc(
              p(
                link({ auto: true, href: '//test.co/(123)remirror.io' })(
                  'test.co/(1<cursor>23)remirror.io',
                ),
              ),
            ),
          )
          .press('Enter');

        expect(editor.doc).toEqualRemirrorDocument(
          doc(
            p(link({ auto: true, href: '//test.co/' })('test.co/'), '(1'),
            p('23)', link({ auto: true, href: '//remirror.io' })('remirror.io')),
          ),
        );
      });
    });
  });
});
