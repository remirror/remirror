import { useState } from 'react';

import { ThemeProvider } from '@remirror/react-components';

import { DevStoreProps, DevStoreProvider } from './dev-state';
import { DevToolsCollapsed } from './dev-tools-collapsed';
import { DevToolsExpanded } from './dev-tools-expanded';

interface DevToolsProps extends DevStoreProps {
  supportsToggling?: boolean;
}

export const DevTools = (props: DevToolsProps): JSX.Element => {
  const { manager, savedSnapshots, diffWorker = false, supportsToggling = false } = props;
  const [opened, setOpened] = useState<boolean>(!supportsToggling);

  const open = () => supportsToggling && setOpened(true);
  const close = () => supportsToggling && setOpened(false);

  return (
    <ThemeProvider>
      <DevStoreProvider manager={manager} savedSnapshots={savedSnapshots} diffWorker={diffWorker}>
        {opened ? <DevToolsExpanded close={close} /> : <DevToolsCollapsed open={open} />}
      </DevStoreProvider>
    </ThemeProvider>
  );
};
