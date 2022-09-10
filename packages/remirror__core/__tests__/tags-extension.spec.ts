import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { ApplySchemaAttributes, extension, ExtensionTag, mutateTag, NodeExtension } from 'remirror';
import { hideConsoleError } from 'testing';

import { TagsExtension } from '../';

// Hides console messages
hideConsoleError(true);

extensionValidityTest(TagsExtension);

describe('tags', () => {
  class InvalidExtension extends NodeExtension {
    get name() {
      return 'invalid';
    }

    // @ts-expect-error
    createTags() {
      return ['awesome'];
    }

    createNodeSpec(extra: ApplySchemaAttributes) {
      return { attrs: extra.defaults() };
    }
  }

  it('tags are added to the schema', () => {
    @extension({ disableExtraAttributes: true })
    class CustomExtension extends NodeExtension {
      get name() {
        return 'custom' as const;
      }

      createTags() {
        return [ExtensionTag.Alignment];
      }

      createNodeSpec() {
        return {};
      }
    }

    const editor = renderEditor<CustomExtension>([new CustomExtension()]);
    expect(editor.manager.nodes.custom.group).toBe(ExtensionTag.Alignment);
  });

  it('throws when an invalid tag is added', () => {
    expect(() =>
      // @ts-expect-error
      renderEditor<InvalidExtension>([new InvalidExtension()]),
    ).toThrowErrorMatchingSnapshot();
  });

  it('can mutate the tags', () => {
    mutateTag((Tag) => {
      // @ts-expect-error
      Tag.Awesome = 'awesome';
    });

    // @ts-expect-error
    expect(ExtensionTag.Awesome).toBe('awesome');
    // @ts-expect-error
    const editor = renderEditor<InvalidExtension>([new InvalidExtension()]);
    // @ts-expect-error
    expect(editor.manager.nodes['invalid'].group).toBe('awesome');

    // @ts-expect-error
    delete ExtensionTag.Awesome;
  });
});
