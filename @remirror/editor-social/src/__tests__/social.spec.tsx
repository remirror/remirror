import { render } from '@testing-library/react';
import React from 'react';

import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { SocialEditor } from '..';

test('should place the editor within the correct element', () => {
  const { getByTestId, getByRole } = render(
    <SocialEditor userData={[]} tagData={[]} onMentionChange={jest.fn()} initialContent={docNodeBasicJSON} />,
  );

  const editor = getByRole('textbox');
  const wrapper = getByTestId('remirror-editor');
  expect(wrapper).toContainElement(editor);
});
