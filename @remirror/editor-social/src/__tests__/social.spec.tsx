import { render } from '@testing-library/react';
import React from 'react';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { SocialEditor } from '..';

test('should place the editor within the correct element', () => {
  const { getByTestId, getByRole } = render(
    <SocialEditor
      userData={[]}
      tagData={[]}
      onMentionChange={console.log}
      initialContent={docNodeBasicJSON}
      emojiData={{} as any}
    />,
  );

  const editor = getByRole('textbox');
  const wrapper = getByTestId('remirror-editor');
  expect(wrapper).toContainElement(editor);
});
