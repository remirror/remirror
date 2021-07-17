import { extensionValidityTest } from 'jest-remirror';

import { CollaborationExtension } from '../';

extensionValidityTest(CollaborationExtension, { clientID: 'abc' });
