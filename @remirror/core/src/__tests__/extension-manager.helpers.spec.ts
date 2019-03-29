import { ExtensionMapValue, transformExtensionMap } from '../extension-manager.helpers';
import { Doc, Paragraph, Text } from '../nodes';

describe('transformExtensionMap', () => {
  it('maps the extensions', () => {
    const doc = new Doc();
    const p = new Paragraph();
    const exts: ExtensionMapValue[] = [{ extension: doc, priority: 2 }, { extension: p, priority: 2 }];
    expect(transformExtensionMap(exts)).toEqual([doc, p]);
  });

  it('sorts the extensions by priority', () => {
    const doc = new Doc();
    const p = new Paragraph();
    const text = new Text();
    const exts: ExtensionMapValue[] = [
      { extension: doc, priority: 1 },
      { extension: p, priority: 2 },
      { extension: text, priority: -1 },
    ];
    expect(transformExtensionMap(exts)).toEqual([text, doc, p]);
  });
});
