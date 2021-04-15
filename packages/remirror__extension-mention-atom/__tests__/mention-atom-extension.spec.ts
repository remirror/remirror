import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';
import { createCoreManager } from 'remirror/extensions';
import { htmlToProsemirrorNode, prosemirrorNodeToHtml } from '@remirror/core';

import { MentionAtomExtension, MentionAtomOptions } from '../';

extensionValidityTest(MentionAtomExtension, { matchers: [] });

describe('schema', () => {
  const { schema } = createCoreManager([
    new MentionAtomExtension({ matchers: [{ char: '@', name: 'at' }] }),
  ]);
  const attributes = { id: 'test', label: '@test', name: 'testing' };

  const { mentionAtom, p, doc } = pmBuild(schema, {
    mentionAtom: { nodeType: 'mentionAtom', ...attributes },
  });

  it('creates the correct dom node', () => {
    expect(prosemirrorNodeToHtml(p(mentionAtom()))).toMatchInlineSnapshot(`
      <p>
        <span class="remirror-mention-atom remirror-mention-atom-testing"
              data-mention-atom-id="test"
              data-mention-atom-name="testing"
        >
          @test
        </span>
      </p>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = htmlToProsemirrorNode({
      schema,
      content: `<span class="remirror-mention-atom remirror-mention-atom-testing" data-mention-atom-id="${attributes.id}" data-mention-atom-name="${attributes.name}">${attributes.label}</a>`,
    });
    const expected = doc(p(mentionAtom()));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

describe('onClick', () => {
  const options = {
    matchers: [
      { char: '#', name: 'tag' },
      { char: '@', name: 'at' },
      { char: '+', name: 'plus' },
    ],
  };

  const { add, doc, p, mentionAtom, view, extension } = create(options);

  it('responds to clicks', () => {
    const clickHandler = jest.fn(() => true);
    extension.addHandler('onClick', clickHandler);
    const atMention = mentionAtom({ id: '@hello', name: 'at', label: '@hello' })();
    const node = p('first ', atMention);
    add(doc(node));

    view.someProp('handleClickOn', (fn) => fn(view, 8, atMention, 8, {}, true));
    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        pos: 8,
        node: expect.any(Object),
      }),
    );

    view.someProp('handleClick', (fn) => fn(view, 2, node, 1, {}, true));
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });
});

/**
 * Create the mention extension with an optional `onChange` handler.
 */
function create(options: MentionAtomOptions) {
  const extension = new MentionAtomExtension({ ...options });
  const editor = renderEditor([extension]);
  const { add, view, manager, commands } = editor;
  const { doc, p } = editor.nodes;
  const { mentionAtom } = editor.attributeNodes;

  return { add, doc, p, mentionAtom, view, manager, commands, editor, extension };
}
