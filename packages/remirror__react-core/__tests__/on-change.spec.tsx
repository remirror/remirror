import { RemirrorTestChain } from 'jest-remirror';
import { docNodeBasicJSON } from 'testing';
import { strictRender } from 'testing/react';
import type { RemirrorJSON } from '@remirror/core';

import { createReactManager, OnChangeHTML, OnChangeJSON, Remirror } from '../';

test('calls the onChange handler on document change with JSON serialized state', () => {
  const mock = jest.fn<void, RemirrorJSON[]>();

  const manager = createReactManager([]);
  const chain = RemirrorTestChain.create(manager);

  strictRender(
    <Remirror initialContent={docNodeBasicJSON} manager={manager}>
      <OnChangeJSON onChange={mock} />
    </Remirror>,
  );

  const { p, doc } = chain.nodes;

  chain.add(doc(p('This<cursor>')));

  const json1 = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This',
          },
        ],
      },
    ],
  };
  expect(mock).toHaveBeenCalledWith(json1);

  chain.insertText(' change');

  const json2 = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This change',
          },
        ],
      },
    ],
  };
  expect(mock).toHaveBeenCalledWith(json2);
});

test('calls the onChange handler on document change with HTML serialized state', () => {
  const mock = jest.fn<void, string[]>();

  const manager = createReactManager([]);
  const chain = RemirrorTestChain.create(manager);

  strictRender(
    <Remirror initialContent={docNodeBasicJSON} manager={manager}>
      <OnChangeHTML onChange={mock} />
    </Remirror>,
  );

  const { p, doc } = chain.nodes;

  chain.add(doc(p('This<cursor>')));

  expect(mock).toHaveBeenCalledWith(`<p>This</p>`);

  chain.insertText(' change');

  expect(mock).toHaveBeenCalledWith(`<p>This change</p>`);
});
