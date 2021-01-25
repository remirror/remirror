import { useState } from 'react';
import { ThemeProvider } from '@remirror/react-components';

import { DebuggerStoreProps, DebuggerStoreProvider } from './debugger-state';
import { DebuggerToolsCollapsed } from './debugger-tools-collapsed';
import { DevToolsExpanded } from './debugger-tools-expanded';

interface DevToolsProps extends DebuggerStoreProps {
  supportsToggling?: boolean;
  dock?: boolean;
}

export const DebuggerTools = (props: DevToolsProps): JSX.Element => {
  const { manager, diffWorker = false, supportsToggling = false, dock = true } = props;
  const [opened, setOpened] = useState<boolean>(!supportsToggling);

  const open = () => supportsToggling && setOpened(true);
  const close = () => supportsToggling && setOpened(false);

  return (
    <ThemeProvider>
      <DebuggerStoreProvider manager={manager} diffWorker={diffWorker}>
        {opened ? (
          <DevToolsExpanded close={close} dock={dock} />
        ) : (
          <DebuggerToolsCollapsed open={open} />
        )}
      </DebuggerStoreProvider>
    </ThemeProvider>
  );
};
