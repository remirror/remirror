import { pm } from '@test-utils';
import { insertText } from '..';

const { p, doc } = pm;

test('insertText', () => {
  const text = 'insert me ';
  const from = doc(p('Something <a>is here'));
  const to = doc(p(`Something ${text}<a>is here`));
  expect(insertText(text)).transformsNode({ from, to });
});
