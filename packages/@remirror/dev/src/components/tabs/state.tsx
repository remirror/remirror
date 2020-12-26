import styled from '@emotion/styled';

import theme from '../../dev-constants';
import {
  collapsedStateFormatSelection,
  expandedStateFormatSelection,
} from '../../utils/format-selection-object';
import { SplitView, SplitViewColumn } from '../components/split-view';
import { JsonTree } from '../json-tree';
import EditorStateContainer from '../state/editor';
import StateTabStateContainer from '../state/state-tab';
import { Heading, HeadingButton, HeadingWithButton } from './../components/heading';

const JsonTreeWrapper = styled('div')({
  padding: '0 0 9px 0',
  overflow: 'hidden',
});
JsonTreeWrapper.displayName = 'JsonTreeWrapper';

const Section = styled('div')({
  minWidth: '180px',
  boxSizing: 'border-box',

  '& + &': {
    paddingTop: '9px',
  },
});
Section.displayName = 'Section';

const Group = styled('div')({
  margin: '0.5em 0px 0.5em 1em',
});
Group.displayName = 'Group';

const GroupRow = styled('div')({
  paddingTop: '0.25em',
});
GroupRow.displayName = 'GroupRow';

const Key = styled('span')({
  display: 'inline-block',
  color: theme.syntax.base0D,
  margin: '0px 0.5em 0px 0px',
});
Key.displayName = 'Key';

const ValueNum = styled('span')({
  color: theme.syntax.base09,
});
ValueNum.displayName = 'ValueNum';

const LogNodeButton = styled('button')({
  color: theme.white60,
  background: 'none',
  border: 'none',
  transition: 'background 0.3s, color 0.3s',
  borderRadius: '3px',

  '&:hover': {
    cursor: 'pointer',
    background: theme.main40,
    color: theme.white,
  },

  '&:focus': {
    outline: 'none',
  },
});
LogNodeButton.displayName = 'LogNodeButton';

export function getItemString(doc, action) {
  return function getItemStringWithBindedDoc(type, value, defaultView, keysCount) {
    const logButton = (
      <LogNodeButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          action({ doc, node: value });
        }}
      >
        log
      </LogNodeButton>
    );

    if (type === 'Object' && value.type) {
      return (
        <span>
          {'{} '}
          {value.type} {logButton}
        </span>
      );
    }

    return (
      <span>
        {defaultView} {keysCount} {logButton}
      </span>
    );
  };
}

function getItemStringForMark(type, value, defaultView, keysCount) {
  if (type === 'Object' && value.type) {
    return (
      <span>
        {'{} '}
        {value.type}
      </span>
    );
  }

  return (
    <span>
      {defaultView} {keysCount}
    </span>
  );
}

export function shouldExpandNode(expandPath, nodePath) {
  const path = [].concat(nodePath).reverse();

  if (!expandPath) {
    return false;
  }

  // Expand attrs if node has them.
  expandPath.push('attrs');

  if (path.length > expandPath.length) {
    return false;
  }

  if (path.join('.') === expandPath.join('.')) {
    return true;
  }

  if (path.every((el, idx) => el === expandPath[idx])) {
    return true;
  }

  return false;
}

export const StateTab = (): JSX.Element => {
  return (
    <Subscribe to={[EditorStateContainer, StateTabStateContainer]}>
      {(editorState, stateTab) => {
        const { logNodeFromJSON } = editorState;
        const { state, activeMarks, expandPath } = editorState.state;
        const { toggleSelection } = stateTab;
        const { selectionExpanded } = stateTab.state;
        const doc = state.doc.toJSON();

        return (
          <SplitView>
            <SplitViewColumn grow>
              <HeadingWithButton>
                <Heading>Current Doc</Heading>
                <HeadingButton onClick={() => console.log(state)}>Log State</HeadingButton>
              </HeadingWithButton>
              <JsonTree
                data={doc}
                hideRoot
                getItemString={getItemString(doc, logNodeFromJSON)}
                shouldExpandNode={(nodePath) => shouldExpandNode(expandPath, nodePath)}
              />
            </SplitViewColumn>
            <SplitViewColumn sep minWidth={220}>
              <Section>
                <HeadingWithButton>
                  <Heading>Selection</Heading>
                  <HeadingButton onClick={() => toggleSelection()}>
                    {selectionExpanded ? '▼' : '▶'}
                  </HeadingButton>
                </HeadingWithButton>
                <JsonTreeWrapper>
                  <JsonTree
                    data={
                      selectionExpanded
                        ? expandedStateFormatSelection(state.selection)
                        : collapsedStateFormatSelection(state.selection)
                    }
                    hideRoot
                  />
                </JsonTreeWrapper>
              </Section>
              <Section>
                <Heading>Active Marks</Heading>
                <JsonTreeWrapper>
                  {activeMarks.length ? (
                    <JsonTree data={activeMarks} hideRoot getItemString={getItemStringForMark} />
                  ) : (
                    <Group>
                      <GroupRow>
                        <Key>no active marks</Key>
                      </GroupRow>
                    </Group>
                  )}
                </JsonTreeWrapper>
              </Section>
              <Section>
                <Heading>Document Stats</Heading>
                <Group>
                  <GroupRow>
                    <Key>nodeSize:</Key>
                    <ValueNum>{state.doc.nodeSize}</ValueNum>
                  </GroupRow>
                  <GroupRow>
                    <Key>childCount:</Key>
                    <ValueNum>{state.doc.childCount}</ValueNum>
                  </GroupRow>
                </Group>
              </Section>
            </SplitViewColumn>
          </SplitView>
        );
      }}
    </Subscribe>
  );
};
