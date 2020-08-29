import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { hideConsoleError } from '@remirror/testing';
import {
  ApplySchemaAttributes,
  extensionDecorator,
  ExtensionTag,
  mutateTag,
  NodeExtension,
} from 'remirror/core';

import { TagsExtension } from '..';

// Hides console messages
hideConsoleError(true);

extensionValidityTest(TagsExtension);

describe('tags', () => {
  class InvalidExtension extends NodeExtension {
    get name() {
      return 'invalid';
    }

    // @ts-expect-error
    tags = ['awesome'];

    createNodeSpec(extra: ApplySchemaAttributes) {
      return { attrs: extra.defaults() };
    }
  }

  it('tags are added to the schema', () => {
    @extensionDecorator({ disableExtraAttributes: true })
    class CustomExtension extends NodeExtension {
      get name() {
        return 'custom';
      }

      tags = [ExtensionTag.Alignment];

      createNodeSpec() {
        return {};
      }
    }

    const editor = renderEditor([new CustomExtension()]);
    expect(editor.manager.nodes['custom'].group).toBe(ExtensionTag.Alignment);
  });

  it('throws when an invalid tag is added', () => {
    // @ts-expect-error
    expect(() => renderEditor([new InvalidExtension()])).toThrowErrorMatchingSnapshot();
  });

  it('can mutate the tags', () => {
    mutateTag((Tag) => {
      // @ts-expect-error
      Tag.Awesome = 'awesome';
    });

    // @ts-expect-error
    expect(ExtensionTag.Awesome).toBe('awesome');
    // @ts-expect-error
    const editor = renderEditor([new InvalidExtension()]);
    // @ts-expect-error
    expect(editor.manager.nodes['invalid'].group).toBe('awesome');

    // @ts-expect-error
    delete ExtensionTag.Awesome;
  });
});
