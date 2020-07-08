import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';

import { fromHtml, GetHandler, toHtml } from '@remirror/core';
import { createCoreManager, isExtensionValid } from '@remirror/testing';

import { LinkExtension, LinkOptions } from '..';

test('is valid', () => {
  expect(isExtensionValid(LinkExtension, {}));
});

const href = 'https://test.com';

describe('schema', () => {
  let { schema } = createCoreManager([new LinkExtension()]);
  let { a, doc, p } = pmBuild(schema, {
    a: { markType: 'link', href },
  });

  beforeEach(() => {
    ({ schema } = createCoreManager([new LinkExtension()] );
    ({ a, doc, p } = pmBuild(schema, {
      a: { markType: 'link', href },
    }));
  });

  it('uses the href', () => {
    expect(toHtml({ node: p(a('link')), schema })).toBe(
      `<p><a href="${href}" rel="noopener noreferrer nofollow">link</a></p>`,
    );
  });

  it('it can parse content', () => {
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
      ],
    );

    it('sets the extra attributes', () => {
      expect(schema.marks.link.spec.attrs).toEqual({
        href: {},
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
        ],
      );

      expect(schema.marks.link.spec.attrs).toEqual({
        custom: { default: 'failure' },
        title: { default: null },
        href: {},
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

function create(handlers?: GetHandler<LinkOptions>) {
  const linkExtension = new LinkExtension();

  if (handlers) {
    linkExtension.addHandler('onActivateLink', handlers.onActivateLink);
  }

  return renderEditor([linkExtension]);
}

describe('commands', () => {
  const {
    add,
    attributeMarks: { link },
    nodes: { doc, p },
    commands,
    active,
    view,
  } = create();

  describe('.removeLink', () => {
    describe('command', () => {
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

  describe('.updateLink', () => {
    describe('command', () => {
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
    });

    describe('.active', () => {
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
});

describe('keys', () => {
  const onActivateLink = jest.fn(() => {});
  const {
    add,
    nodes: { doc, p },
  } = create({ onActivateLink });

  it('responds to Mod-k', () => {
    add(doc(p(`<cursor>Link`)))
      .shortcut('Mod-k')
      .callback(({ start, end }) => {
        expect({ start, end }).toEqual({ start: 1, end: 5 });
        expect(onActivateLink).toHaveBeenCalled();
      });
  });

  it('does not call handler when no nearby word', () => {
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
    } = create();
    const testLink = link({ href });

    add(doc(p(testLink('Li<cursor>nk'))))
      .fire({ event: 'click' })
      .callback(({ start, end }) => {
        expect({ start, end }).toEqual({ start: 1, end: 5 });
      });
  });
});
