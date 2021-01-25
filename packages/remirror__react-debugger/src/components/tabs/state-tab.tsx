import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Mark, RemirrorJSON } from '@remirror/core';

import { mainTheme } from '../../debugger-constants';
import { useDebuggerStore } from '../../debugger-state';
import {
  collapsedStateFormatSelection,
  expandedStateFormatSelection,
} from '../../utils/format-selection-object';
import { JsonTree } from '../json-tree';
import { Heading, HeadingButton, HeadingWithButton, SplitView, SplitViewColumn } from '../styled';

export function getItemString(
  doc: RemirrorJSON,
  action: (doc: RemirrorJSON, node: RemirrorJSON) => void,
) {
  return function getBoundItemString(
    type: string,
    value: RemirrorJSON,
    defaultView: ReactNode,
    keysCount: string,
  ): JSX.Element {
    const logButton = (
      <LogNodeButton
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          action(doc, value);
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

function getItemStringForMark(
  type: string,
  value: Mark,
  defaultView: ReactNode,
  keysCount: string,
) {
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

export function shouldExpandNode(
  expandPath: Array<string | number>,
  nodePath: Array<string | number>,
): boolean {
  const path = [...nodePath].reverse();

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
  const { actions, state, activeMarks, expandPath, selectionExpanded } = useDebuggerStore();
  const doc = state.doc.toJSON() as RemirrorJSON;

  return (
    <SplitView>
      <SplitViewColumn grow>
        <HeadingWithButton>
          <Heading>Current Doc</Heading>
          <HeadingButton
            onClick={() => {
              // eslint-disable-next-line no-console
              return console.log(state);
            }}
          >
            Log State
          </HeadingButton>
        </HeadingWithButton>
        <JsonTree
          data={doc}
          hideRoot
          getItemString={getItemString(doc, actions.logNodeFromJSON)}
          shouldExpandNode={(nodePath) => shouldExpandNode(expandPath, nodePath)}
        />
      </SplitViewColumn>
      <SplitViewColumn sep minWidth={220}>
        <Section>
          <HeadingWithButton>
            <Heading>Selection</Heading>
            <HeadingButton onClick={() => actions.toggleSelection()}>
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
            {activeMarks.length > 0 ? (
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
};

const JsonTreeWrapper = styled.div`
  padding: 0 0 9px 0;
  overflow: hidden;
`;

const Section = styled.div`
  min-width: 180px;
  box-sizing: border-box;

  & + & {
    padding-top: 9px;
  }
`;

const Group = styled('div')({
  margin: '0.5em 0px 0.5em 1em',
});

const GroupRow = styled('div')({
  paddingTop: '0.25em',
});

const Key = styled('span')({
  display: 'inline-block',
  color: mainTheme.syntax.base0D,
  margin: '0px 0.5em 0px 0px',
});

const ValueNum = styled('span')({
  color: mainTheme.syntax.base09,
});

const LogNodeButton = styled('button')({
  color: mainTheme.white60,
  background: 'none',
  border: 'none',
  transition: 'background 0.3s, color 0.3s',
  borderRadius: '3px',

  '&:hover': {
    cursor: 'pointer',
    background: mainTheme.main40,
    color: mainTheme.white,
  },

  '&:focus': {
    outline: 'none',
  },
});
