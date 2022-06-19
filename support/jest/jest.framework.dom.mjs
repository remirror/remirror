import { default as JestAxe } from 'jest-axe';
import { setupProsemirrorEnvironment } from 'jest-prosemirror';
import { ignoreJSDOMWarnings, setupRemirrorEnvironment } from 'jest-remirror';

import('@testing-library/jest-dom/extend-expect');

expect.extend(JestAxe.toHaveNoViolations);

/* Add matchers for jest-prosemirror */
setupProsemirrorEnvironment();

/* Setup Remirror test environment */
setupRemirrorEnvironment();
ignoreJSDOMWarnings();
