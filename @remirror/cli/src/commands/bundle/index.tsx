/* tslint:disable: no-void-expression */

import { render } from 'ink';
import React from 'react';
import { CommandModule } from 'yargs';
import { Bundle } from './components';
import { bundleFile } from './parcel';
import { BundleArgv } from './types';

export const bundle: CommandModule<{}, BundleArgv> = {
  async handler(args) {
    const runBundler = () => bundleFile(args);
    render(<Bundle args={args} startTime={Date.now()} runBundler={runBundler} />);
  },
  builder: {},
  command: 'bundle <source>',
  describe: 'Bundle an editor for consumption in native code',
};
