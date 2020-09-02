import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { MentionAtomExtension } from '..';

console.log(MentionAtomExtension.instanceName);

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
    expect(toHtml({ node: p(mentionAtom()), schema })).toMatchInlineSnapshot(`
      <p>
        <span class="mention-atom mention-atom-testing"
              data-mention-atom-id="test"
              data-mention-atom-name="testing"
        >
          @test
        </span>
      </p>
    `);
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHtml({
      schema,
      content: `<span class="mention-atom mention-atom-testing" data-mention-atom-id="${attributes.id}" data-mention-atom-name="${attributes.name}">${attributes.label}</a>`,
    });
    const expected = doc(p(mentionAtom()));

    expect(node).toEqualProsemirrorNode(expected);
  });
});
