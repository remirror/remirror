import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { HeadingExtension } from 'remirror/extensions';

import { BidiExtension } from '../';

extensionValidityTest(BidiExtension);

test('captures the direction of each node', () => {
  const {
    add,
    nodes: { p, doc },
    view,
  } = renderEditor([new BidiExtension()]);

  add(doc(p('first paragraph'), p('بسيطة'), p('@')));
  expect(view.dom).toMatchSnapshot();
});

test('updates to the default direction affect the attributes', () => {
  const extension = new BidiExtension();
  const {
    add,
    nodes: { p, doc },
    view,
  } = renderEditor([extension]);

  add(doc(p('first paragraph')));
  extension.setOptions({ defaultDirection: 'rtl', autoUpdate: true });
  expect(view.dom).toMatchSnapshot();
});

test('updates the direction based on typing', () => {
  const { insertText, view, selectText } = renderEditor([new BidiExtension({ autoUpdate: true })]);

  insertText('بسيطة');
  expect(view.dom).toMatchSnapshot();

  selectText({ from: 1, to: 7 }).replace('other');
  expect(view.dom).toMatchSnapshot();
});

describe('options', () => {
  it('respects the `defaultDirection` option', () => {
    const {
      add,
      nodes: { p, doc },
      view,
    } = renderEditor([new BidiExtension({ defaultDirection: 'rtl', autoUpdate: true })]);

    add(doc(p('first paragraph'), p('بسيطة'), p('@')));
    expect(view.dom).toMatchSnapshot();
  });

  it('can turn off `autoUpdate`', () => {
    const extension = new BidiExtension({ autoUpdate: false });
    const { insertText, view } = renderEditor([extension]);

    insertText('بسيطة');
    expect(view.dom).toMatchSnapshot();

    extension.setOptions({ autoUpdate: true });
    insertText('بسيطة');
    expect(view.dom).toMatchSnapshot();
  });

  it('can make use of `excludedNodes`', () => {
    const extension = new BidiExtension({ excludeNodes: ['heading'], autoUpdate: true });
    const {
      add,
      nodes: { p, doc, heading },
      view,
    } = renderEditor([extension, new HeadingExtension()]);

    add(doc(p('<cursor>'), heading('')))
      .insertText('بسيطة')
      .jumpTo(8)
      .insertText('بسيطة');
    expect(view.dom).toMatchSnapshot();
  });
});
