/* tslint:disable: no-void-expression */

import { render } from 'ink';
import React from 'react';
import { CommandModule } from 'yargs';
import { Bundle } from './cli-components';
import { bundleFile } from './cli-parcel';
import { BundleArgv } from './cli-types';

export const bundle: CommandModule<{}, BundleArgv> = {
  async handler(args) {
    const runBundler = () => bundleFile(args);
    render(<Bundle args={args} startTime={Date.now()} runBundler={runBundler} />);
  },
  builder: {},
  command: 'bundle <source>',
  describe: 'Bundle an editor for consumption in native code',
};
