import { TestExtension } from '@remirror/test-fixtures';

import { transformExtensionMap } from '../extension-manager.helpers';
import { DocumentExtension, TextExtension } from '../nodes';

describe('transformExtensionMap', () => {
  it('maps the extensions', () => {
    const document_ = new DocumentExtension();
    const test = new TestExtension();
    const text = new TextExtension();
    const extensions = [
      { extension: document_, priority: 2 },
      { extension: test, priority: 2 },
      { extension: text, priority: 2 },
    ];

    expect(transformExtensionMap(extensions)).toEqual([document_, test, text]);
  });

  it('sorts the extensions by priority', () => {
    const document_ = new DocumentExtension();
    const test = new TestExtension();
    const text = new TextExtension();
    const extensions = [
      { extension: document_, priority: 1 },
      { extension: test, priority: 2 },
      { extension: text, priority: -1 },
    ];

    expect(transformExtensionMap(extensions)).toEqual([text, document_, test]);
  });

  it('can sort with default priority', () => {
    const document_ = new DocumentExtension();
    const test = new TestExtension();
    const text = new TextExtension();
    const extensions = [
      { extension: document_, priority: 1 },
      test,
      { extension: text, priority: -1 },
    ];

    expect(transformExtensionMap(extensions)).toEqual([text, document_, test]);
  });
});
