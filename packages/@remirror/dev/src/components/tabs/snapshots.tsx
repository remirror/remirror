import styled from '@emotion/styled';
import React from 'react';
import { Subscribe } from 'unstated';

import theme from '../../dev-constants';
import { InfoPanel } from '../components/info-panel';
import { SplitView, SplitViewColumn } from '../components/split-view';
import { List } from '../list';
import EditorStateContainer from '../state/editor';

const ActionButton = styled('button')({
  padding: '6px 10px',
  fontWeight: 400,
  letterSpacing: '1px',
  fontSize: '11px',
  color: theme.white80,
  background: theme.white10,
  textTransform: 'uppercase',
  transition: 'background 0.3s, color 0.3s',
  borderRadius: '2px',
  border: 'none',

  '& + &': {
    marginLeft: '4px',
  },

  '&:hover': {
    background: theme.main40,
    color: theme.white,
    cursor: 'pointer',
  },

  '&:focus': {
    outline: 'none',
  },

  '&:active': {
    background: theme.main60,
  },
});
ActionButton.displayName = 'ActionButton';

const ListItem = styled('div')({
  height: '24px',
  lineHeight: '24px',
  display: 'flex',
  width: '100%',
});
ListItem.displayName = 'ListItem';

const ListItemTitle = styled('div')({
  flexGrow: 1,
});
ListItemTitle.displayName = 'ListItemTitle';

export function SnapshotsList({ snapshots, deleteSnapshot, loadSnapshot }) {
  return (
    <List
      getKey={(item) => item.name + item.timestamp}
      items={snapshots}
      title={(item) => (
        <ListItem>
          <ListItemTitle>{item.name}</ListItemTitle>
          <div>
            <ActionButton onClick={() => deleteSnapshot(item)}>delete</ActionButton>
            <ActionButton onClick={() => loadSnapshot(item)}>restore</ActionButton>
          </div>
        </ListItem>
      )}
    />
  );
}

class SnapshotTab extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.snapshots !== nextProps.snapshots;
  }

  render() {
    const { snapshots, loadSnapshot, deleteSnapshot } = this.props;

    return (
      <SplitView>
        <SplitViewColumn removePadding grow>
          {snapshots && snapshots.length ? (
            <SnapshotsList
              snapshots={snapshots}
              loadSnapshot={loadSnapshot}
              deleteSnapshot={deleteSnapshot}
            />
          ) : (
            <InfoPanel>No saved snapshots yet. Press "Save Snapshot" button to add one.</InfoPanel>
          )}
        </SplitViewColumn>
      </SplitView>
    );
  }
}

export const SnapshotsTab = (): JSX.Element => {
  return (
    <Subscribe to={[EditorStateContainer]}>
      {({ state: { snapshots }, loadSnapshot, deleteSnapshot }) => {
        return (
          <SnapshotTab
            snapshots={snapshots}
            loadSnapshot={loadSnapshot}
            deleteSnapshot={deleteSnapshot}
          />
        );
      }}
    </Subscribe>
  );
};
