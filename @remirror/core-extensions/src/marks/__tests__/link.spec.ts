import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import { LinkExtension, LinkExtensionOptions } from '../link';

const href = 'https://test.com';

describe('schema', () => {
  const { schema } = createBaseTestManager([{ extension: new LinkExtension(), priority: 1 }]);
  const { a, doc, p } = pmBuild(schema, {
    a: { markType: 'link', href },
  });

  it('uses the href', () => {
    expect(toHTML({ node: p(a('link')), schema })).toBe(
      `<p><a href="${href}" rel="noopener noreferrer nofollow">link</a></p>`,
    );
  });

  it('it can parse content', () => {
    const node = fromHTML({
      content: `<p><a href="${href}">link</a></p>`,
      schema,
    });
    const expected = doc(p(a('link')));
    expect(node).toEqualPMNode(expected);
  });
});

const create = (params: LinkExtensionOptions = {}) =>
  renderEditor({
    attrMarks: [new LinkExtension({ ...params })],
    plainNodes: [],
  });

describe('actions', () => {
  let {
    getState,
    add,
    actions,
    attrMarks: { link },
    nodes: { doc, p },
  } = create();

  beforeEach(() => {
    ({
      getState,
      add,
      actions,
      attrMarks: { link },
      nodes: { doc, p },
    } = create());
  });

  describe('.linkRemove', () => {
    describe('.command()', () => {
      it('removes links when selection is wrapped', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        actions.linkRemove.command();
        expect(getState()).toContainRemirrorDocument(p('Paragraph A link'));
      });

      it('removes the link cursor is within', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('A <cursor>link'))));
        actions.linkRemove.command();
        expect(getState()).toContainRemirrorDocument(p('Paragraph A link'));
      });

      it('removes all links when selection contains multiples', () => {
        const testLink = link({ href });
        add(doc(p('<all>', testLink('1'), ' ', testLink('2'), ' ', testLink('3'))));
        actions.linkRemove.command();
        expect(getState()).toContainRemirrorDocument(p('1 2 3'));
      });
    });

    describe('.isEnabled()', () => {
      it('is not enabled when not selected', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph<cursor> ', testLink('A link'))));
        expect(actions.linkRemove.isEnabled()).toBeFalse();
      });

      it('is enabled with selection wrapped', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        expect(actions.linkRemove.isEnabled()).toBeTrue();
      });

      it('is enabled with cursor within link', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('A <cursor>link'))));
        expect(actions.linkRemove.isEnabled()).toBeTrue();
      });

      it('is enabled with selection of multiple nodes', () => {
        const testLink = link({ href });
        add(doc(p('<all>Paragraph ', testLink('A link'))));
        expect(actions.linkRemove.isEnabled()).toBeTrue();
      });
    });
  });

  describe('.linkUpdate', () => {
    describe('.command()', () => {
      it('creates a link for the selection', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph <start>A link<end>')));
        actions.linkUpdate.command({ href });
        expect(getState()).toContainRemirrorDocument(p('Paragraph ', testLink('<start>A link<end>')));
      });

      it('does nothing for an empty selection', () => {
        add(doc(p('Paragraph <cursor>A link')));
        actions.linkUpdate.command({ href });
        expect(getState()).toContainRemirrorDocument(p('Paragraph A link'));
      });

      it('can update an existing link', () => {
        const testLink = link({ href });
        const attrs = { href: 'https://alt.com' };
        const altLink = link(attrs);
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        actions.linkUpdate.command(attrs);
        expect(getState()).toContainRemirrorDocument(p('Paragraph ', altLink('<start>A link<end>')));
      });

      it('overwrites multiple existing links', () => {
        const testLink = link({ href });
        add(doc(p('<all>', testLink('1'), ' ', testLink('2'), ' ', testLink('3'))));
        actions.linkUpdate.command({ href });
        expect(getState()).toContainRemirrorDocument(p(testLink('1 2 3')));
      });
    });

    describe('.isActive()', () => {
      it('is not active when not selected', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph<cursor> ', testLink('A link'))));
        expect(actions.linkUpdate.isActive()).toBeFalse();
      });

      it('is active with selection wrapped', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('<start>A link<end>'))));
        expect(actions.linkUpdate.isActive()).toBeTrue();
      });

      it('is active with cursor within link', () => {
        const testLink = link({ href });
        add(doc(p('Paragraph ', testLink('A <cursor>link'))));
        expect(actions.linkUpdate.isActive()).toBeTrue();
      });

      it('is active with selection of multiple nodes', () => {
        const testLink = link({ href });
        add(doc(p('<all>Paragraph ', testLink('A link'))));
        expect(actions.linkUpdate.isActive()).toBeTrue();
      });
    });

    describe('.isEnabled()', () => {
      it('is enabled when text is selected', () => {
        add(doc(p('Paragraph <start>A<end> link')));
        expect(actions.linkUpdate.isEnabled()).toBeTrue();
      });

      it('is not enabled for empty selections', () => {
        add(doc(p('Paragraph <cursor>A link')));
        expect(actions.linkUpdate.isEnabled()).toBeFalse();
      });

      it('is not enabled for node selections', () => {
        add(doc(p('Paragraph <node>A link')));
        expect(actions.linkUpdate.isEnabled()).toBeFalse();
      });
    });
  });
});

describe('keys', () => {
  it('responds to Mod-k', () => {
    const activationHandler = jest.fn(() => true);
    const {
      add,
      nodes: { doc, p },
    } = create({ activationHandler });
    const { state } = add(doc(p(`<cursor>Link`))).shortcut('Mod-k');
    const { from, to } = state.selection;
    expect({ from, to }).toEqual({ from: 1, to: 5 });
    expect(activationHandler).toHaveBeenCalled();
  });
  it('does not call handler when no nearby word', () => {
    const activationHandler = jest.fn(() => true);
    const {
      add,
      nodes: { doc, p },
    } = create({ activationHandler });
    const { state } = add(doc(p(`<cursor> Link`))).shortcut('Mod-k');
    const { from, to } = state.selection;
    expect({ from, to }).toEqual({ from: 1, to: 1 });
    expect(activationHandler).not.toHaveBeenCalled();
  });
});

describe('plugin', () => {
  let {
    getState,
    add,
    attrMarks: { link },
    nodes: { doc, p },
  } = create();

  beforeEach(() => {
    ({
      getState,
      add,
      attrMarks: { link },
      nodes: { doc, p },
    } = create());
  });

  describe('clickHandler', () => {
    it('selects the full text of the link when clicked', () => {
      const testLink = link({ href });
      add(doc(p(testLink('Li<cursor>nk')))).fire({ event: 'click' });
      const { from, to } = getState().selection;
      expect({ from, to }).toEqual({ from: 1, to: 5 });
    });
  });
});
