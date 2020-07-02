import { act, render } from '@testing-library/react';
import { RemirrorTestChain } from 'jest-remirror';
import React from 'react';

import { docNodeBasicJSON } from '@remirror/test-fixtures';

import { createSocialManager, SocialEditor } from '..';

describe('social editor', () => {
  it('should place the editor within the correct element', () => {
    const { getByTestId, getByRole } = render(
      <SocialEditor
        userData={[]}
        tagData={[]}
        onMentionChange={jest.fn()}
        initialContent={docNodeBasicJSON}
      />,
    );

    const editor = getByRole('textbox');
    const wrapper = getByTestId('remirror-editor');

    expect(wrapper).toContainElement(editor);
  });

  it('should support content', () => {
    const manager = createSocialManager([]);
    const chain = RemirrorTestChain.create(manager);

    render(
      <SocialEditor
        manager={manager}
        userData={[]}
        tagData={[]}
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
