import { schema } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { values } from 'remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  corePreset,
  HeadingExtension,
  wysiwygPreset,
} from 'remirror/extensions';

import {
  ApplySchemaAttributes,
  ExtensionTag,
  MarkExtension,
  NodeExtension,
  PlainExtension,
  RemirrorManager,
  SchemaExtension,
} from '../';

extensionValidityTest(SchemaExtension);

describe('dynamic schema attributes', () => {
  it('should dynamically add attributes when configured', () => {
    let paragraphId = 0;
    let markId = 0;

    const mark = {
      paragraph: jest.fn(() => `${++paragraphId}`),
      marks: jest.fn(() => `${++markId}`),
    };

    const editor = renderEditor(
      [new HeadingExtension(), new BlockquoteExtension(), new BoldExtension()],
      {
        extraAttributes: [
          { identifiers: ['paragraph'], attributes: { id: { default: mark.paragraph } } },
          { identifiers: 'marks', attributes: { id: mark.marks } },
        ],
      },
    );

    const { doc, heading: h } = editor.nodes;

    editor.add(doc(h('This is a heading<cursor>')));
    expect(mark.paragraph).not.toHaveBeenCalled();
    expect(mark.marks).not.toHaveBeenCalled();

    editor.insertText('\nWelcome to the **bold** experiment\n\n\n');
    expect(mark.marks).toHaveBeenCalledTimes(1);
    expect(mark.paragraph).toHaveBeenCalledTimes(4);

    const outerHtml = editor.dom.outerHTML;
    expect(editor.dom.outerHTML).toMatchSnapshot();

    editor.selectText(1);

    // Nothing should have changed.
    expect(mark.marks).toHaveBeenCalledTimes(1);
    expect(mark.paragraph).toHaveBeenCalledTimes(4);
    expect(outerHtml).toMatchDiffSnapshot(editor.dom.outerHTML);
  });
});

test('custom schema', () => {
  const editor = renderEditor([], { schema });

  expect(editor.schema).toBe(schema);
  expect(Object.keys(editor.manager.nodes)).toMatchSnapshot();
  expect(Object.keys(editor.manager.marks)).toMatchSnapshot();
});

describe('extraAttributes', () => {
  it('should support adding attributes to `nodes`, `marks`, and `all`', () => {
    const manager = RemirrorManager.create(() => [...wysiwygPreset(), ...corePreset()], {
      extraAttributes: [
        { identifiers: 'nodes', attributes: { totallyNodes: 'abc' } },
        { identifiers: 'marks', attributes: { totallyMarks: 'abc' } },
        { identifiers: 'all', attributes: { totallyAll: 'abc' } },
      ],
    });

    for (const type of values(manager.schema.nodes)) {
      if (['doc', 'text'].includes(type.name)) {
        continue;
      }

      expect(type.spec.attrs?.totallyNodes).toEqual({ default: 'abc' });
      expect(type.spec.attrs).not.toHaveProperty('totallyMarks');
      expect(type.spec.attrs?.totallyAll).toEqual({ default: 'abc' });
    }

    for (const type of values(manager.schema.marks)) {
      expect(type.spec.attrs?.totallyMarks).toEqual({ default: 'abc' });
      expect(type.spec.attrs).not.toHaveProperty('totallyNodes');
      expect(type.spec.attrs?.totallyAll).toEqual({ default: 'abc' });
    }
  });

  it('should support adding attributes by name', () => {
    const manager = RemirrorManager.create(() => [...wysiwygPreset(), ...corePreset()], {
      extraAttributes: [
        { identifiers: ['bold'], attributes: { totallyBold: 'abc' } },
        { identifiers: ['paragraph', 'italic'], attributes: { fun: 'abc' } },
      ],
    });

    expect(manager.schema.nodes.paragraph.spec.attrs?.fun).toEqual({ default: 'abc' });
    expect(manager.schema.marks.italic.spec.attrs?.fun).toEqual({ default: 'abc' });
    expect(manager.schema.marks.bold.spec.attrs).not.toHaveProperty('fun');
    expect(manager.schema.marks.bold.spec.attrs?.totallyBold).toEqual({ default: 'abc' });
  });

  it('should support adding attributes by tag', () => {
    // Here to ensure no errors are caused when a plain extension is found.
    class ThePlainExtension extends PlainExtension {
      get name() {
        return 'thePlain' as const;
      }

      createTags() {
        return [ExtensionTag.Alignment];
      }
    }

    class TheMarkExtension extends MarkExtension {
      get name() {
        return 'theMark' as const;
      }

      createTags() {
        return [ExtensionTag.Alignment, ExtensionTag.Color];
      }

      createMarkSpec(extra: ApplySchemaAttributes) {
        return {
          attrs: extra.defaults(),
        };
      }
    }

    class TheNodeExtension extends NodeExtension {
      get name() {
        return 'theNode' as const;
      }

      createTags() {
        return [ExtensionTag.Alignment];
      }

      createNodeSpec(extra: ApplySchemaAttributes) {
        return {
          attrs: extra.defaults(),
        };
      }
    }

    const manager = RemirrorManager.create(
      () => [
        ...wysiwygPreset(),
        ...corePreset(),
        new ThePlainExtension(),
        new TheMarkExtension(),
        new TheNodeExtension(),
      ],
      {
        extraAttributes: [
          // Matches everything
          {
            identifiers: { tags: [ExtensionTag.Alignment] },
            attributes: { matchesEverything: 'abc' },
          },

          // Only marks
          {
            identifiers: { tags: [ExtensionTag.Alignment], type: 'mark' },
            attributes: { onlyMarks: 'abc' },
          },

          // No matches
          { identifiers: { tags: [] }, attributes: { emptyTags: 'abc' } },

          // No matches - too exclusive
          {
            identifiers: { tags: [ExtensionTag.Color], type: 'node' },
            attributes: { tooExclusive: 'abc' },
          },
        ],
      },
    );

    expect(manager.schema.nodes.theNode.spec.attrs?.matchesEverything).toEqual({
      default: 'abc',
    });
    expect(manager.schema.nodes.theNode.spec.attrs).not.toHaveProperty('onlyMarks');
    expect(manager.schema.nodes.theNode.spec.attrs).not.toHaveProperty('emptyTags');
    expect(manager.schema.nodes.theNode.spec.attrs).not.toHaveProperty('tooExclusive');

    expect(manager.schema.marks.theMark.spec.attrs?.matchesEverything).toEqual({
      default: 'abc',
    });
    expect(manager.schema.marks.theMark.spec.attrs?.onlyMarks).toEqual({ default: 'abc' });
    expect(manager.schema.marks.theMark.spec.attrs).not.toHaveProperty('emptyTags');
    expect(manager.schema.marks.theMark.spec.attrs).not.toHaveProperty('tooExclusive');
  });
});
