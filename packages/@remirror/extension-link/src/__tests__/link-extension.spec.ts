import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { LinkExtension, LinkOptions } from '..';

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
    expect(toHtml({ node: p(a('link')), schema })).toBe(
      `<p><a href="${href}" rel="noopener noreferrer nofollow">link</a></p>`,
    );
  });

  it('can parse content', () => {
    const node = fromHtml({
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
        auto: { default: false },
      });
    });

    it('parses extra attributes', () => {
      const { a, doc, p } = pmBuild(schema, {
        a: { markType: 'link', href, custom, title },
      });

      const node = fromHtml({
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

  if (options.onActivateLink) {
    linkExtension.addHandler('onActivateLink', options.onActivateLink);
  }

  return renderEditor([linkExtension]);
}

describe('commands', () => {
  let {
    add,
    attributeMarks: { link },
    nodes: { doc, p },
    commands,
    active,
    view,
  } = create();

  beforeEach(() => {
    ({
      add,
      attributeMarks: { link },
      nodes: { doc, p },
      commands,
      active,
      view,
    } = create());
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

      it('does nothing for an empty selection', () => {
        add(doc(p('Paragraph <cursor>A link')));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(p('Paragraph A link'));
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

      it('overwrites multiple existing links', () => {
        const testLink = link({ href });
        add(doc(p('<all>', testLink('1'), ' ', testLink('2'), ' ', testLink('3'))));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(p(testLink('1 2 3')));
      });

      it('can select all and create a link', () => {
        const testLink = link({ href });
        add(doc(p('<all>', '1', ' ', '2', ' ', '3')));
        commands.updateLink({ href });

        expect(view.state).toContainRemirrorDocument(p(testLink('1 2 3')));
      });
    });

    describe('.isEnabled()', () => {
      it('is enabled when text is selected', () => {
        add(doc(p('Paragraph <start>A<end> link')));

        expect(commands.updateLink.isEnabled()).toBeTrue();
      });

      it('is not enabled for empty selections', () => {
        add(doc(p('Paragraph <cursor>A link')));

        expect(commands.updateLink.isEnabled()).toBeFalse();
      });

      it('is not enabled for node selections', () => {
        add(doc(p('Paragraph <node>A link')));

        expect(commands.updateLink.isEnabled()).toBeFalse();
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
  const onActivateLink = jest.fn(() => {});

  it('responds to Mod-k', () => {
    const {
      add,
      nodes: { doc, p },
    } = create({ onActivateLink });

    add(doc(p(`<cursor>Link`)))
      .shortcut('Mod-k')
      .callback(({ start, end }) => {
        expect({ start, end }).toEqual({ start: 1, end: 5 });
        expect(onActivateLink).toHaveBeenCalled();
      });
  });

  it('does not call handler when no nearby word', () => {
    const {
      add,
      nodes: { doc, p },
    } = create({ onActivateLink });

    add(doc(p(`<cursor> Link`)))
      .shortcut('Mod-k')
      .callback(({ start, end }) => {
        expect({ start, end }).toEqual({ start: 1, end: 1 });
        expect(onActivateLink).not.toHaveBeenCalled();
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
      .callback(({ start, end }) => {
        expect({ start, end }).toEqual({ start: 1, end: 5 });
      });
  });
});

describe('autolinking', () => {
  const editor = create({ autoLink: true });
  const { doc, p } = editor.nodes;
  const { link } = editor.attributeMarks;

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

  it('should be off by default', () => {
    const editor = create();
    const { doc, p } = editor.nodes;

    editor.add(doc(p('<cursor>'))).insertText('test.co');
    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.co')));

    editor.insertText(' https://test.com ');
    expect(editor.doc).toEqualRemirrorDocument(doc(p('test.co https://test.com ')));
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
