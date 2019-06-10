import { transformExtensionMap } from '../extension-manager.helpers';
import { DocExtension, ParagraphExtension, TextExtension } from '../nodes';

describe('transformExtensionMap', () => {
  it('maps the extensions', () => {
    const doc = new DocExtension();
    const p = new ParagraphExtension();
    const extensions = [{ extension: doc, priority: 2 }, { extension: p, priority: 2 }];
    expect(transformExtensionMap(extensions)).toEqual([doc, p]);
  });

  it('sorts the extensions by priority', () => {
    const doc = new DocExtension();
    const p = new ParagraphExtension();
    const text = new TextExtension();
    const extensions = [
      { extension: doc, priority: 1 },
      { extension: p, priority: 2 },
      { extension: text, priority: -1 },
    ];
    expect(transformExtensionMap(extensions)).toEqual([text, doc, p]);
  });

  it('can sort with default priority', () => {
    const doc = new DocExtension();
    const p = new ParagraphExtension();
    const text = new TextExtension();
    const extensions = [{ extension: doc, priority: 1 }, p, { extension: text, priority: -1 }];
    expect(transformExtensionMap(extensions)).toEqual([text, doc, p]);
  });
});
