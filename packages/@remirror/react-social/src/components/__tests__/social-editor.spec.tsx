import { RemirrorTestChain } from 'jest-remirror';
import React from 'react';

import { docNodeBasicJSON } from '@remirror/testing';
import { act, createReactManager, strictRender } from '@remirror/testing/react';

import { SocialEditor, socialManagerArgs } from '../..';

describe('social editor', () => {
  it('should place the editor within the correct element', () => {
    const { getByTestId, getByRole } = strictRender(
      <SocialEditor items={[]} onMentionChange={jest.fn()} initialContent={docNodeBasicJSON} />,
    );

    const editor = getByRole('textbox');
    const wrapper = getByTestId('remirror-editor');

    expect(wrapper).toContainElement(editor);
  });

  it('should support content', () => {
    const manager = createReactManager(...socialManagerArgs([]));
    const chain = RemirrorTestChain.create(manager);

    strictRender(
      <SocialEditor
        manager={manager}
        items={[]}
        onMentionChange={jest.fn()}
        initialContent={docNodeBasicJSON}
      />,
    );

    const {
      nodes: { p, doc },
      attributeMarks: { mention },
      view,
      add,
    } = chain;
    act(() => {
      add(
        doc(
          p(
            'This is the social editor ',
            mention({ id: 'abc', href: '/user/abc', label: '@abc', name: 'at' })('@abc'),
          ),
          p('Awesome <cursor>'),
        ),
      )
        .insertText(':heart: ')
        .insertText('website.co');
    });

    expect(view.dom).toMatchSnapshot();
  });
});
