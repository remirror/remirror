import { toHaveNoViolations } from 'jest-axe';
import { createSerializer, matchers } from 'jest-emotion';
import { ignoreJSDOMWarnings, setupRemirrorEnvironment } from 'jest-remirror';

require('jest-dom/extend-expect');
expect.addSnapshotSerializer(createSerializer({}));
expect.extend(toHaveNoViolations);
expect.extend(matchers);

setupRemirrorEnvironment();
ignoreJSDOMWarnings();
