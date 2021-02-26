import { assertGet } from '@remirror/core';

import { useDebuggerStore } from '../../debugger-state';
import { JsonTree } from '../json-tree';
import { List } from '../list';
import { Heading, InfoPanel, SplitView, SplitViewColumn } from '../styled';

function valueRenderer(raw: string, ...rest: Array<string | number>) {
  if (typeof rest[0] === 'function') {
    return 'func';
  }

  return raw;
}

const PluginState = (props: { pluginState: any }) => {
  return (
    <div>
      <Heading>Plugin State</Heading>
      <JsonTree data={props.pluginState} valueRenderer={valueRenderer} />
    </div>
  );
};

export const PluginsTab = (): JSX.Element => {
  const { state, selectedPlugin: selected, actions } = useDebuggerStore();
  const plugins = state.plugins;
  const selectedPlugin = assertGet(plugins, selected);
  const selectedPluginState = selectedPlugin.getState(state);

  return (
    <SplitView>
      <SplitViewColumn removePadding>
        <List
          items={plugins}
          getKey={(plugin) => (plugin as any).key}
          title={(plugin) => (plugin as any).key}
          isSelected={(_, index) => selected === index}
          isDimmed={(plugin) => !plugin.getState(state)}
          onListItemClick={(_, index) => actions.selectPlugin(index)}
        />
      </SplitViewColumn>
      <SplitViewColumn grow sep>
        {selectedPluginState ? (
          <PluginState pluginState={selectedPluginState} />
        ) : (
          // eslint-disable-next-line react/no-unescaped-entities
          <InfoPanel>Plugin doesn't have any state</InfoPanel>
        )}
      </SplitViewColumn>
    </SplitView>
  );
};
