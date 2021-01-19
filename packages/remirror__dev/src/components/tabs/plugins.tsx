import React from 'react';
import { Subscribe } from 'unstated';

import { InfoPanel } from '../components/info-panel';
import JSONTree from '../components/json-tree';
import { SplitView, SplitViewColumn } from '../components/split-view';
import { List } from '../list';
import EditorStateContainer from '../state/editor';
import PluginsTabStateContainer from '../state/plugins-tab';
import { Heading } from './../components/heading';

export function valueRenderer(raw, ...rest) {
  if (typeof rest[0] === 'function') {
    return 'func';
  }

  return raw;
}

export function PluginState(props) {
  return (
    <div>
      <Heading>Plugin State</Heading>
      <JSONTree data={props.pluginState} valueRenderer={valueRenderer} />
    </div>
  );
}

export const PluginsTab = (): JSX.Element => {
  return (
    <Subscribe to={[EditorStateContainer, PluginsTabStateContainer]}>
      {(editorState, pluginsTabState) => {
        const { state } = editorState.state;
        const plugins = state.plugins;
        const selectedPlugin = plugins[pluginsTabState.state.selected];
        const selectedPluginState = selectedPlugin.getState(state);

        return (
          <SplitView>
            <SplitViewColumn removePadding>
              <List
                items={plugins}
                getKey={(plugin) => plugin.key}
                title={(plugin) => plugin.key}
                isSelected={(plugin, index) => pluginsTabState.state.selected === index}
                isDimmed={(plugin) => !plugin.getState(state)}
                onListItemClick={(plugin, index) => pluginsTabState.selectPlugin(index)}
              />
            </SplitViewColumn>
            <SplitViewColumn grow sep>
              {selectedPluginState ? (
                <PluginState pluginState={selectedPluginState} />
              ) : (
                <InfoPanel>Plugin doesn't have any state</InfoPanel>
              )}
            </SplitViewColumn>
          </SplitView>
        );
      }}
    </Subscribe>
  );
};
