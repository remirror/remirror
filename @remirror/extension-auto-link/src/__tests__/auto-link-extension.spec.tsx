import { renderEditor } from 'jest-remirror';

import { AutoLinkExtension, UrlUpdateHandlerParameter } from '../auto-link-extension';

const {
  nodes: { doc, p },
  attributeMarks: { autoLink },
  add,
} = renderEditor([new AutoLinkExtension()]);

describe('AutoLinkExtension', () => {
  it('can update a link automatically', () => {
    add(doc(p('i am here<cursor>')))
      .insertText(' hello.com ')
      .callback(({ state }) => {
        expect(state).toContainRemirrorDocument(
          p('i am here ', autoLink({ href: '//hello.com' })('hello.com'), ' '),
        );
      });
  });

  it('notifies when updated', () => {
    const mock = jest.fn(({ urls }: UrlUpdateHandlerParameter) => {
      expect(urls[0]).toBe('//hello.co');
    });

    const extension = new AutoLinkExtension();

    const {
      nodes: { doc, p },
      add,
    } = renderEditor([extension]);

    const dispose = extension.addHandler('onUrlUpdate', mock);

    add(doc(p('i am here<cursor>')))
      .insertText(' hello.co')
      .callback(() => {
        expect(mock).toHaveBeenCalledTimes(1);
        mock.mockClear();
        dispose();
      })
      .insertText(' test.com')
      .callback(() => {
        expect(mock).not.toHaveBeenCalled();
      });
  });
});
