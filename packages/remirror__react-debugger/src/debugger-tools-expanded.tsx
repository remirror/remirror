import { FC } from 'react';
import Dock from 'react-dock';
import { Tab, TabList, TabPanel } from 'reakit';
import { Icon } from '@remirror/react';

import {
  CloseButton,
  CssReset,
  DockContainer,
  HistoryTab,
  PluginsTab,
  SaveSnapshotButton,
  SchemaTab,
  SnapshotsTab,
  StateTab,
  StructureTab,
} from './components';
import { NodePicker, NodePickerTrigger } from './components/node-picker';
import { TabName } from './debugger-constants';
import { useDebuggerStore } from './debugger-state';

interface DevToolsExpandedProps {
  close: () => void;
  dock: boolean;
}

export const DevToolsExpanded = (props: DevToolsExpandedProps): JSX.Element => {
  const { close, dock } = props;
  const { actions, nodePicker, tabState, selectedTab } = useDebuggerStore();

  return (
    <Wrapper dock={dock}>
      <DockContainer>
        <CloseButton onClick={close}>
          <Icon name='closeLine' />
        </CloseButton>
        <NodePickerTrigger
          onClick={nodePicker.active ? actions.deactivatePicker : actions.activatePicker}
          isActive={nodePicker.active}
        >
          <Icon name='dragDropLine' />
        </NodePickerTrigger>
        <SaveSnapshotButton onClick={() => actions.saveSnapshot(`${Date.now()}`)}>
          Save Snapshot
        </SaveSnapshotButton>

        <TabList {...tabState} aria-label='Remirror Dev Tools | Tabs'>
          <Tab {...tabState} id={TabName.State}>
            State
          </Tab>
          <Tab {...tabState} id={TabName.History}>
            History
          </Tab>
          <Tab {...tabState} id={TabName.Plugins}>
            Plugins
          </Tab>
          <Tab {...tabState} id={TabName.Schema}>
            Schema
          </Tab>
          <Tab {...tabState} id={TabName.Structure}>
            Structure
          </Tab>
          <Tab {...tabState} id={TabName.Snapshots}>
            Snapshots
          </Tab>
          <Tab {...tabState} id={TabName.JsonEditor}>
            JSON Editor
          </Tab>
        </TabList>
        <TabPanel {...tabState} tabId={TabName.State}>
          {selectedTab === TabName.State && <StateTab />}
        </TabPanel>
        <TabPanel {...tabState} tabId={TabName.History}>
          {selectedTab === TabName.History && <HistoryTab />}
        </TabPanel>
        <TabPanel {...tabState} tabId={TabName.Plugins}>
          {selectedTab === TabName.Plugins && <PluginsTab />}
        </TabPanel>
        <TabPanel {...tabState} tabId={TabName.Schema}>
          {selectedTab === TabName.Schema && <SchemaTab />}
        </TabPanel>
        <TabPanel {...tabState} tabId={TabName.Structure}>
          {selectedTab === TabName.Structure && <StructureTab />}
        </TabPanel>
        <TabPanel {...tabState} tabId={TabName.Snapshots}>
          {selectedTab === TabName.Snapshots && <SnapshotsTab />}
        </TabPanel>
        <TabPanel {...tabState} tabId={TabName.JsonEditor}>
          {selectedTab === TabName.JsonEditor && <StateTab />}
        </TabPanel>
      </DockContainer>
    </Wrapper>
  );
};

interface WrapperProps {
  dock: boolean;
}
const Wrapper: FC<WrapperProps> = (props) => {
  const { children, dock } = props;
  const { actions, nodePicker } = useDebuggerStore();

  if (dock) {
    return (
      <CssReset>
        <NodePicker
          nodePicker={nodePicker}
          onClose={actions.deactivatePicker}
          onMouseMove={actions.updateNodePickerPosition}
          onSelect={actions.selectNodePicker}
        />
        <Dock
          position='bottom'
          dimMode='none'
          isVisible
          defaultSize={0.5}
          onSizeChange={(devToolsSize) => {
            const size = devToolsSize * window.innerHeight;
            document.documentElement.style.marginBottom = `${size}px`;
          }}
        >
          {children}
        </Dock>
      </CssReset>
    );
  }

  return <>children</>;
};
