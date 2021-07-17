import styled from '@emotion/styled';

import { mainTheme } from '../../debugger-constants';
import { DebuggerState, useDebuggerStore } from '../../debugger-state';
import { DebuggerSnapshot } from '../../debugger-types';
import { List } from '../list';
import { InfoPanel, SplitView, SplitViewColumn } from '../styled';

interface SnapshotsListProps {
  actions: DebuggerState;
  snapshots: DebuggerSnapshot[];
}

const SnapshotsList = (props: SnapshotsListProps) => {
  const { actions, snapshots } = props;

  return (
    <List
      getKey={(item) => `${item.name}${item.timestamp}`}
      items={snapshots}
      title={(item) => (
        <ListItem>
          <ListItemTitle>{item.name}</ListItemTitle>
          <div>
            <ActionButton onClick={() => actions.deleteSnapshot(item)}>delete</ActionButton>
            <ActionButton onClick={() => actions.loadSnapshot(item)}>restore</ActionButton>
          </div>
        </ListItem>
      )}
    />
  );
};

export const SnapshotsTab = (): JSX.Element => {
  const { snapshots, actions } = useDebuggerStore();

  return (
    <SplitView>
      <SplitViewColumn removePadding grow>
        {snapshots && snapshots.length > 0 ? (
          <SnapshotsList snapshots={snapshots} actions={actions} />
        ) : (
          <InfoPanel>
            No saved snapshots yet. Press &ldquo;Save Snapshot&rdquo; button to add one.
          </InfoPanel>
        )}
      </SplitViewColumn>
    </SplitView>
  );
};

const ActionButton = styled.button({
  padding: '6px 10px',
  fontWeight: 400,
  letterSpacing: '1px',
  fontSize: '11px',
  color: mainTheme.white80,
  background: mainTheme.white10,
  textTransform: 'uppercase',
  transition: 'background 0.3s, color 0.3s',
  borderRadius: '2px',
  border: 'none',

  '& + &': {
    marginLeft: '4px',
  },

  '&:hover': {
    background: mainTheme.main40,
    color: mainTheme.white,
    cursor: 'pointer',
  },

  '&:focus': {
    outline: 'none',
  },

  '&:active': {
    background: mainTheme.main60,
  },
});

const ListItem = styled.div({
  height: '24px',
  lineHeight: '24px',
  display: 'flex',
  width: '100%',
});

const ListItemTitle = styled.div({
  flexGrow: 1,
});
