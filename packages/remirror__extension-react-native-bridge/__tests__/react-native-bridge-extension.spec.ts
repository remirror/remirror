import { extensionValidityTest } from 'jest-remirror';

import { ReactNativeBridgeExtension } from '../';

extensionValidityTest(ReactNativeBridgeExtension, { actions: {}, data: {} });
