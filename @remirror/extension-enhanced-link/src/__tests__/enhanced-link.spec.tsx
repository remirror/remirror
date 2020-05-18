import { renderEditor } from 'jest-remirror';

import { EnhancedLinkExtension, UrlUpdateHandlerParameter } from '../enhanced-link-extension';

describe('EnhancedLinkExtension', () => {
  it('can update a link automatically', () => {
    const tester = renderEditor({ extensions: [EnhancedLinkExtension.of()], presets: [] });
    const { doc, p } = tester.nodes;
    const { enhancedLink } = tester.attributeMarks;

    tester
      .add(doc(p('i am here<cursor>')))
      .insertText(' hello.com ')
      .callback(({ state }) => {
        expect(state).toContainRemirrorDocument(
          p('i am here ', enhancedLink({ href: 'http://hello.com' })('hello.com'), ' '),
        );
      });
  });

  it('notifies when updated', () => {
    expect.assertions(2);

    const mock = jest.fn(({ urls }: UrlUpdateHandlerParameter) => {
      expect(urls[0]).toBe('http://hello.co');
    });

    const tester = renderEditor({
      extensions: [EnhancedLinkExtension.of({ properties: { onUrlUpdate: mock } })],
      presets: [],
    });
    const { doc, p } = tester.nodes;

    tester
      .add(doc(p('i am here<cursor>')))
      .insertText(' hello.co')
      .callback(() => {
        expect(mock).toHaveBeenCalledTimes(1);
      });
  });
});
