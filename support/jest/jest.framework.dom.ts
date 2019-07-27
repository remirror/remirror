import { toHaveNoViolations } from 'jest-axe';
import { createSerializer, matchers } from 'jest-emotion';
import { setupProsemirrorEnvironment } from 'jest-prosemirror';
import { ignoreJSDOMWarnings, setupRemirrorEnvironment } from 'jest-remirror';

/* Auto cleanup DOM after each test */
require('@testing-library/react/cleanup-after-each');
require('@testing-library/jest-dom/extend-expect');
expect.addSnapshotSerializer(createSerializer({}));
expect.extend(toHaveNoViolations);
expect.extend(matchers);

/* Add matchers for jest-prosemirror */
setupProsemirrorEnvironment();

/* Setup Remirror test environment */
setupRemirrorEnvironment();
ignoreJSDOMWarnings();
