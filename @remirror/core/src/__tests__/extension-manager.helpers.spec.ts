import { TestExtension } from '@remirror/test-fixtures';
import { transformExtensionMap } from '../extension-manager.helpers';
import { DocExtension, TextExtension } from '../nodes';

describe('transformExtensionMap', () => {
  it('maps the extensions', () => {
    const doc = new DocExtension();
    const test = new TestExtension();
    const text = new TextExtension();
    const extensions = [
      { extension: doc, priority: 2 },
      { extension: test, priority: 2 },
      { extension: text, priority: 2 },
    ];
    expect(transformExtensionMap(extensions)).toEqual([doc, test, text]);
  });

  it('sorts the extensions by priority', () => {
    const doc = new DocExtension();
    const test = new TestExtension();
    const text = new TextExtension();
    const extensions = [
      { extension: doc, priority: 1 },
      { extension: test, priority: 2 },
      { extension: text, priority: -1 },
    ];
    expect(transformExtensionMap(extensions)).toEqual([text, doc, test]);
  });

  it('can sort with default priority', () => {
    const doc = new DocExtension();
    const test = new TestExtension();
    const text = new TextExtension();
    const extensions = [{ extension: doc, priority: 1 }, test, { extension: text, priority: -1 }];
    expect(transformExtensionMap(extensions)).toEqual([text, doc, test]);
  });
});
