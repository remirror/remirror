import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import {
  ApplySchemaAttributes,
  extension,
  ExtensionTag,
  htmlToProsemirrorNode,
  NodeExtension,
  NodeExtensionSpec,
  prosemirrorNodeToHtml,
} from 'remirror';
import { createCoreManager, LinkExtension, LinkOptions } from 'remirror/extensions';

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

  return renderEditor([linkExtension]);
}

describe('commands', () => {
  let onUpdateLink = jest.fn(() => {});
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

    describe('.isEnabled()', () => {
      it('is not enabled when not selected', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph<cursor> ', testLink('A link'))));

        expect(commands.removeLink.isEnabled()).toBeFalse();
      });

      it('is enabled with selection wrapped', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));

        expect(commands.removeLink.isEnabled()).toBeTrue();
      });

      it('is enabled with cursor within link', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('A <cursor>link'))));

        expect(commands.removeLink.isEnabled()).toBeTrue();
      });

      it('is enabled with selection of multiple nodes', () => {
        const testLink = link({ href });
        add(doc(p('<all>Paragraph ', testLink('A link'))));

        expect(commands.removeLink.isEnabled()).toBeTrue();
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

    describe('.isEnabled()', () => {
      it('is enabled when text is selected', () => {
        add(doc(p('Paragraph <start>A<end> link')));

        expect(commands.updateLink.isEnabled({ href: '' })).toBeTrue();
      });

      it('is not enabled for empty selections', () => {
        add(doc(p('Paragraph <cursor>A link')));

        expect(commands.updateLink.isEnabled({ href: '' })).toBeFalse();
      });

      it('is not enabled for node selections', () => {
        add(doc(p('Paragraph <node>A link')));

        expect(commands.updateLink.isEnabled({ href: '' })).toBeFalse();
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

        expect(commands.updateLink.isEnabled({ href: '' })).toBeFalse();
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
  const onShortcut = jest.fn(() => {});

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

describe('plugin', () => {
  it('clickHandler selects the full text of the link when clicked', () => {
    const {
      add,
      attributeMarks: { link },
      nodes: { doc, p },
    } = create({ selectTextOnClick: true });
    const testLink = link({ href });

    add(doc(p(testLink('Li<cursor>nk'))))
      .fire({ event: 'click' })
      .callback(({ from, to }) => {
        expect({ from, to }).toEqual({ from: 1, to: 5 });
      });
  });

  it('clickHandler opens link when clicked', () => {
    const {
      add,
      attributeMarks: { link },
      nodes: { doc, p },
    } = create({ openLinkOnClick: true });
    const testLink = link({ href });

    jest.spyOn(global, 'open').mockImplementation();

    add(doc(p(testLink('Li<cursor>nk'))))
      .fire({ event: 'click' })
      .callback(() => {
        expect(global.open).toHaveBeenCalled();
      });
  });
});

describe('autolinking', () => {
  let onUpdateLink = jest.fn(() => {});
  let editor = create({ autoLink: true, onUpdateLink });
  let { doc, p } = editor.nodes;
  let { link } = editor.attributeMarks;

  beforeEach(() => {
    onUpdateLink = jest.fn(() => {});
    editor = create({ autoLink: true, onUpdateLink });
    ({
      attributeMarks: { link },
      nodes: { doc, p },
    } = editor);
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
  });

  it('calls the onUpdateLink handler when auto linking', () => {
    let editorText = 'test.co';
    editor.add(doc(p('<cursor>'))).insertText(editorText);

    expect(onUpdateLink).toHaveBeenCalledWith(editorText, {
      doc: editor.doc,
      selection: editor.view.state.selection,
      range: {
        from: 1,
        to: editorText.length + 1,
        cursor: editorText.length + 1,
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
        cursor: editorText.length + 1,
      },
      attrs: { auto: true, href: '//test.com' },
    });
  });

  it('should be off by default', () => {
    const editor = create({ onUpdateLink });
    const { doc, p } = editor.nodes;

    editor.add(doc(p('<cursor>'))).insertText('test.co');
    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.co')));

    editor.insertText(' https://test.com ');
    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.co https://test.com ')));
  });

  it('should not call the onUpdateLink handler when links are inserted using default settings', () => {
    const editor = create({ onUpdateLink });
    const { doc, p } = editor.nodes;

    editor.add(doc(p('<cursor>'))).insertText('test.co');
    expect(onUpdateLink).not.toHaveBeenCalled();

    editor.insertText(' https://test.com ');
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

  it('supports deleting selected to to invalidate the match', () => {
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
});

describe('onClick', () => {
  it('responds to clicks', () => {
    const onClick = jest.fn(() => false);
    const {
      view,
      add,
      attributeMarks: { link },
      nodes: { doc, p },
    } = create({ autoLink: true, onClick });

    const linkMark = link({ href: '//test.com' })('test.com');
    const node = p('first ', linkMark);
    add(doc(node));

    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {}, false));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        from: 7,
        to: 15,
        text: 'test.com',
        mark: expect.any(Object),
      }),
    );

    view.someProp('handleClick', (fn) => fn(view, 3, node, 1, {}, true));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('can override further options when false is returned', () => {
    let returnValue = true;
    const onClick = jest.fn(() => returnValue);
    const {
      view,
      add,
      attributeMarks: { link },
      nodes: { doc, p },
    } = create({ autoLink: true, onClick, selectTextOnClick: true });

    const linkMark = link({ href: '//test.com' })('test.com');
    const node = p('first ', linkMark);
    add(doc(node));

    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {}, false));
    // It doesn't select the text when the callback returns true.
    expect(view.state.selection.empty).toBeTrue();

    returnValue = false;

    view.someProp('handleClickOn', (fn) => fn(view, 10, node, 1, {}, false));
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
    } = renderEditor([new LinkExtension()]);

    const linkMark = link({ href: '//test.com' })('a <start>long<end> link');
    add(doc(p('Paragraph with ', linkMark, ' and text')));

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
      <p>
        Paragraph with
        <a href="//test.com"
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
