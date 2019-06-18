import { render } from '@testing-library/react';
import React from 'react';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { WysiwygEditor } from '..';

test('it renders within an ssr environment', () => {
  const { getByRole, getByTestId } = render(<WysiwygEditor initialContent={docNodeBasicJSON} />);
  const editor = getByRole('textbox');
  const wrapper = getByTestId('remirror-wysiwyg-editor');
  expect(wrapper).toContainElement(editor);
});
