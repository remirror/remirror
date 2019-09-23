import setStatus from '../ui-a11y-status';

jest.useFakeTimers();

test('setStatus', () => {
  const initialStatus = 'Test status';
  const endStatus = 'Oh well time to go... 😢';
  setStatus(initialStatus);
  const element = document.getElementById('a11y-status-message');
  expect(element).toHaveTextContent(initialStatus);

  jest.advanceTimersByTime(250);
  expect(element).toHaveTextContent(initialStatus);

  setStatus(endStatus);
  expect(element).toHaveTextContent(endStatus);

  jest.advanceTimersByTime(500);
  expect(element).toHaveTextContent('');
});
