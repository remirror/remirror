import { render } from 'ink-testing-library';
import React from 'react';
import { Bundle } from '../cli-components';

describe('Bundle', () => {
  it('should render the initial frame', () => {
    const runBundler = () => Promise.resolve();
    const args = { source: 'simple-file.ts' };
    const { lastFrame } = render(<Bundle args={args} runBundler={runBundler} />);
    expect(lastFrame()).toInclude('⠋  \u001b[90mBundling simple-file.ts\u001b[39m\n');
  });
});
