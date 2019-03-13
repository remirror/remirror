import React from 'react';

import { axe, renderString } from '@test-utils';
import { Remirror } from '..';

test('TextEditor is accessible', async () => {
  const results = await axe(renderString(<Remirror>{() => <div />}</Remirror>));
  expect(results).toHaveNoViolations();
});
