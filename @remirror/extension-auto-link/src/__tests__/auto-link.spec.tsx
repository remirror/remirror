import { renderEditor } from 'jest-remirror';

import { AutoLinkExtension, UrlUpdateHandlerParameter } from '../auto-link-extension';

describe('AutoLinkExtension', () => {
  it('can update a link automatically', () => {
    const {
      nodes: { doc, p },
      attributeMarks: { autoLink },
      add,
    } = renderEditor({ extensions: [new AutoLinkExtension()], presets: [] });

    add(doc(p('i am here<cursor>')))
      .insertText(' hello.com ')
      .callback(({ state }) => {
        expect(state).toContainRemirrorDocument(
          p('i am here ', autoLink({ href: 'http://hello.com' })('hello.com'), ' '),
        );
      });
  });

  it('notifies when updated', () => {
    expect.assertions(2);

    const mock = jest.fn(({ urls }: UrlUpdateHandlerParameter) => {
      expect(urls[0]).toBe('http://hello.co');
    });

    const {
      nodes: { doc, p },
      add,
    } = renderEditor({
      extensions: [new AutoLinkExtension({ properties: { onUrlUpdate: mock } })],
      presets: [],
    });

    add(doc(p('i am here<cursor>')))
      .insertText(' hello.co')
      .callback(() => {
        expect(mock).toHaveBeenCalledTimes(1);
      });
  });
});
