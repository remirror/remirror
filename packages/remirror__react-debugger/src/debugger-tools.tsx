import { useCallback, useMemo, useState } from 'react';
import { ThemeProvider } from '@remirror/react';

import { DebuggerStoreProps, DebuggerStoreProvider } from './debugger-state';
import { DebuggerToolsCollapsed } from './debugger-tools-collapsed';
import { DevToolsExpanded } from './debugger-tools-expanded';

interface DevToolsProps extends DebuggerStoreProps {
  supportsToggling?: boolean;
  dock?: boolean;
}

export const DebuggerTools = (props: DevToolsProps): JSX.Element => {
  const { manager, diffWorker = false, supportsToggling = false, dock = true } = props;
  const { opened, close, open } = useOpenedState(supportsToggling);

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

/**
 * Use the opened state.
 */
function useOpenedState(supportsToggling: boolean) {
  const [opened, setOpened] = useState<boolean>(!supportsToggling);
  const open = useCallback(() => supportsToggling && setOpened(true), [supportsToggling]);
  const close = useCallback(() => supportsToggling && setOpened(false), [supportsToggling]);

  return useMemo(() => ({ open, close, opened }), [close, open, opened]);
}
