import { TestExtension } from '@remirror/test-fixtures';

import { DocExtension, TextExtension } from '../../nodes';
import { transformExtensionOrPreset } from '../manager-helpers';

describe('transformExtensionMap', () => {
  it('maps the extensions', () => {
    const doc = DocExtension.of();
    const test = TestExtension.of({});
    const text = TextExtension.of();
    const extensions = [
      { extension: doc, priority: 2 },
      { extension: test, priority: 2 },
      { extension: text, priority: 2 },
    ];

    expect(transformExtensionOrPreset(extensions)).toEqual([doc, test, text]);
  });

  it('sorts the extensions by priority', () => {
    const doc = DocExtension.of();
    const test = TestExtension.of({ run: true });
    const text = TextExtension.of();
    const extensions = [
      { extension: doc, priority: 1 },
      { extension: test, priority: 2 },
      { extension: text, priority: -1 },
    ];

    expect(transformExtensionOrPreset(extensions)).toEqual([text, doc, test]);
  });

  it('can sort with default priority', () => {
    const doc = DocExtension.of();
    const test = TestExtension.of();
    const text = TextExtension.of();
    const extensions = [{ extension: doc, priority: 1 }, test, { extension: text, priority: -1 }];

    expect(transformExtensionOrPreset(extensions)).toEqual([text, doc, test]);
  });
});
