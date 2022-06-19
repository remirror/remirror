import { jest } from '@jest/globals';

import { setStatus } from '../';

jest.useFakeTimers();

test('setStatus', () => {
  const initialStatus = 'Test status';
  const endStatus = 'Oh well time to go... 😢';

  setStatus(initialStatus);
  const element = document.querySelector('#a11y-status-message');
  expect(element).toHaveTextContent(initialStatus);

  jest.advanceTimersByTime(250);
  expect(element).toHaveTextContent(initialStatus);

  setStatus(endStatus);
  expect(element).toHaveTextContent(endStatus);

  jest.advanceTimersByTime(500);
  expect(element).toHaveTextContent('');
});
