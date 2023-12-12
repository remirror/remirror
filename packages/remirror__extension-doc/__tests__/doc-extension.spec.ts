import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { createCoreManager, HeadingExtension } from 'remirror/extensions';

import { DocExtension } from '../';

extensionValidityTest(DocExtension);

test('supports docAttributes with only keys', () => {
  const { schema } = createCoreManager([new DocExtension({ docAttributes: ['foo', 'bar'] })]);
  const { doc, p } = pmBuild(schema, {});

  expect(doc(p('Hello!')).toJSON()).toEqual({
    type: 'doc',
    attrs: {
      foo: null,
      bar: null,
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello!' }],
      },
    ],
  });
});

test('supports docAttributes with default values', () => {
  const { schema } = createCoreManager([
    new DocExtension({ docAttributes: { foo: 'bar', custom: 'value' } }),
  ]);
  const { doc, p } = pmBuild(schema, {});

  expect(doc(p('Hello!')).toJSON()).toEqual({
    type: 'doc',
    attrs: {
      foo: 'bar',
      custom: 'value',
    },
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello!' }],
      },
    ],
  });
});

describe('commands', () => {
  describe('setDocAttributes', () => {
    it('can set all of the known doc attributes', () => {
      const { add, nodes, attributeNodes, commands, view } = renderEditor([
        new DocExtension({ docAttributes: ['foo', 'baz'] }),
      ]);
      const { p } = nodes;
      const { doc } = attributeNodes;

      add(doc()(p('')));

      expect(view.state.doc.attrs).toEqual({ foo: null, baz: null });

      commands.setDocAttributes({ foo: 'bar', baz: 'qux' });

      expect(view.state.doc).toEqualProsemirrorNode(
        //
        doc({ foo: 'bar', baz: 'qux' })(
          //
          p(),
        ),
      );
    });

    it('ignores unknown doc attributes', () => {
      const { add, nodes, attributeNodes, commands, view } = renderEditor([
        new DocExtension({ docAttributes: ['foo', 'baz'] }),
      ]);
      const { p } = nodes;
      const { doc } = attributeNodes;

      add(doc()(p('')));

      expect(view.state.doc.attrs).toEqual({ foo: null, baz: null });

      commands.setDocAttributes({ not: 'exists' });

      expect(view.state.doc).toEqualProsemirrorNode(
        //
        doc({ foo: null, baz: null })(
          //
          p(),
        ),
      );
    });

    it('can set a subset of the known doc attributes', () => {
      const { add, nodes, attributeNodes, commands, view } = renderEditor([
        new DocExtension({ docAttributes: ['foo', 'baz'] }),
      ]);
      const { p } = nodes;
      const { doc } = attributeNodes;

      add(doc()(p('')));

      expect(view.state.doc.attrs).toEqual({ foo: null, baz: null });

      commands.setDocAttributes({ baz: 'qux' });

      expect(view.state.doc).toEqualProsemirrorNode(
        //
        doc({ foo: null, baz: 'qux' })(
          //
          p(),
        ),
      );
    });
  });
});

describe('helpers', () => {
  describe('`isDefaultDocNode`', () => {
    it('returns true if the current doc contains the default content', () => {
      const { add, nodes, helpers } = renderEditor([new DocExtension()]);
      const { doc, p } = nodes;

      add(doc(p('')));
      expect(helpers.isDefaultDocNode()).toBeTrue();
    });

    it('returns false if the current doc contains text', () => {
      const { add, nodes, helpers } = renderEditor([new DocExtension()]);
      const { doc, p } = nodes;

      add(doc(p('Remirror!')));
      expect(helpers.isDefaultDocNode()).toBeFalse();
    });

    it('returns false if the current doc contains a different node', () => {
      const { add, nodes, helpers } = renderEditor([new DocExtension(), new HeadingExtension()]);
      const { doc, heading } = nodes;

      add(doc(heading('')));
      expect(helpers.isDefaultDocNode()).toBeFalse();
    });

    it('returns true if the current doc matches the custom content expression', () => {
      const { add, nodes, helpers } = renderEditor([
        new DocExtension({
          content: 'heading block+',
        }),
        new HeadingExtension(),
      ]);
      const { doc, heading, p } = nodes;

      add(doc(heading(''), p('')));
      expect(helpers.isDefaultDocNode()).toBeTrue();
    });

    it('returns false if the current doc with custom content expression contains text', () => {
      const { add, nodes, helpers } = renderEditor([new DocExtension(), new HeadingExtension()]);
      const { doc, heading, p } = nodes;

      add(doc(heading('Remirror!'), p('')));
      expect(helpers.isDefaultDocNode()).toBeFalse();
    });

    it("returns false if the current doc's nodes don't match the custom content expression", () => {
      const { add, nodes, attributeNodes, helpers } = renderEditor([
        new DocExtension({
          content: 'heading block+',
        }),
        new HeadingExtension(),
      ]);
      const { doc } = nodes;
      const { heading } = attributeNodes;

      const h1 = heading({ level: 1 });
      const h2 = heading({ level: 2 });

      add(doc(h1(''), h2('')));
      expect(helpers.isDefaultDocNode()).toBeFalse();
    });
  });
});
