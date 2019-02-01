import { render } from '@test-utils';
import React from 'react';
import { Alert } from '../alert.component';

test('docz setup', () => {
  const { asFragment, rerender } = render(<Alert kind='info' />);
  expect(asFragment()).toMatchSnapshot();
  rerender(<Alert kind='negative' />);
  expect(asFragment()).toMatchSnapshot();
});
