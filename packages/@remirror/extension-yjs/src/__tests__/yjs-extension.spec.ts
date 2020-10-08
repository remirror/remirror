import { extensionValidityTest } from 'jest-remirror';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import { YjsExtension } from '..';

extensionValidityTest(YjsExtension, {
  getProvider: () => new WebrtcProvider('global', new Doc()),
});
