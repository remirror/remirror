import React from 'react';

import { TwitterUI } from '@remirror/twitter-ui';

export const ExampleTwitterUI = () => {
  return <TwitterUI onUrlsChange={console.log} attributes={{ 'data-test-id': 'twitter-ui' }} />;
};
