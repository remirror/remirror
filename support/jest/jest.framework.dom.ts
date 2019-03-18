import { toHaveNoViolations } from 'jest-axe';
import { createSerializer, matchers } from 'jest-emotion';
import { setupEnvironment } from 'jest-prosemirror';
import { ignoreJSDOMWarnings, setupRemirrorEnvironment } from 'jest-remirror';

require('jest-dom/extend-expect');
expect.addSnapshotSerializer(createSerializer({}));
expect.extend(toHaveNoViolations);
expect.extend(matchers);

/* Add matchers for jest-prosemirror */
setupEnvironment();

/* Setup Remirror test environment */
setupRemirrorEnvironment();
ignoreJSDOMWarnings();
