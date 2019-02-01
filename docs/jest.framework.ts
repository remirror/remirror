import '../config/jest.framework';

import { toHaveNoViolations } from 'jest-axe';
import 'jest-dom/extend-expect';
import 'react-testing-library/cleanup-after-each';

expect.extend(toHaveNoViolations);

if (process.env.TEST_ENV) {
  jest.setTimeout(20000);
}

/* To fix Prosemirror tests in jsdom */
document.getSelection = () => {
  return {
    addRange: _ => {},
    removeAllRanges: () => {},
  } as Selection;
};
