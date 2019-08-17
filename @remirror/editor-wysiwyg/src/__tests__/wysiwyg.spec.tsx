import { render } from '@test-fixtures/testing-library';
import React from 'react';

import { docNodeBasicJSON } from '@test-fixtures/object-nodes';
import { WysiwygEditor } from '..';

test('it renders within an ssr environment', () => {
  const { getByRole, getByTestId } = render(<WysiwygEditor initialContent={docNodeBasicJSON} />);
  const editor = getByRole('textbox');
  const wrapper = getByTestId('remirror-wysiwyg-editor');
  expect(wrapper).toContainElement(editor);
});
