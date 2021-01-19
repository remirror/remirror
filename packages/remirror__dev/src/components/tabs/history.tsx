import styled from '@emotion/styled';
import React from 'react';

import { mainTheme } from '../../dev-constants';
import { useDevStore } from '../../dev-state';
import { Highlighter } from '../highlighter';
import { JsonDiff } from '../json-diff';
import { List } from '../list';
import { Heading, InfoPanel, SplitView, SplitViewColumn } from '../styled';

const Section = styled('div')({
  minWidth: '180px',
  boxSizing: 'border-box',

  '& + &': {
    paddingTop: '9px',
  },
});
Section.displayName = 'Section';

function pad(num) {
  return `00${num}`.slice(-2);
}

function pad3(num) {
  return `000${num}`.slice(-3);
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad3(date.getMilliseconds()),
  ].join(':');
};

const SelectionContentSection = (props) => {
  if (!props.selectionContent) {
    return null;
  }

  return (
    <Section>
      <Heading>Selection Content</Heading>
      <Highlighter>{props.selectionContent}</Highlighter>
    </Section>
  );
};

const DocDiffSection = (props) => {
  if (!props.diff) {
    return null;
  }

  return (
    <Section>
      <Heading>Doc diff</Heading>
      <JsonDiff delta={props.diff} />
    </Section>
  );
};

const SelectionSection = (props) => {
  if (!props.selection) {
    return null;
  }

  return (
    <Section>
      <Heading>Selection diff</Heading>
      <JsonDiff delta={props.selection} />
    </Section>
  );
};

export const HistoryTab = (): JSX.Element => {
  const {} = useDevStore(['actions', 'selectedHistoryIndex', 'historyRolledBackTo', 'history']);
  const { selectHistoryItem, rollbackHistory } = editorState;
  const { history, selectedHistoryItem, historyRolledBackTo } = editorState.state;
  const prevItem = history[selectedHistoryItem + 1];
  const selectedItem = history[selectedHistoryItem];
  const historyRolledBackToItem = history[historyRolledBackTo];
  const historyList = history
    .reduce((h, item, index) => {
      const prev = h[h.length - 1];

      item.index = index;

      if (!item.diff) {
        if (!prev || !Array.isArray(prev)) {
          h.push([item]);
        } else {
          prev.push(item);
        }
      } else {
        h.push(item);
      }

      return h;
    }, [])
    .reduce((h, item) => {
      if (Array.isArray(item) && item.length === 1) {
        h.push(item[0]);
      } else {
        h.push(item);
      }

      return h;
    }, []);

  const isSelected = (item) => item.timestamp === selectedItem.timestamp;
  const isPrevious = (item) => prevItem && item.timestamp === prevItem.timestamp;
  const isDimmed = (item) =>
    historyRolledBackToItem && item.timestamp > historyRolledBackToItem.timestamp;

  return (
    <SplitView>
      <SplitViewColumn removePadding minWidth={190}>
        <List
          items={historyList}
          getKey={(item) => item.timestamp}
          title={(item) => formatTimestamp(item.timestamp)}
          groupTitle={(item) => {
            return `${formatTimestamp(item[0].timestamp)} [${item.length}]`;
          }}
          isSelected={isSelected}
          isPrevious={isPrevious}
          isDimmed={isDimmed}
          customItemBackground={(props) =>
            props.isSelected
              ? mainTheme.main40
              : props.isPrevious
              ? mainTheme.main20
              : 'transparent'
          }
          onListItemClick={(item) => selectHistoryItem(item.index)}
          onListItemDoubleClick={(item) => rollbackHistory(item.index)}
        />
      </SplitViewColumn>
      <SplitViewColumn grow sep>
        <DocDiffSection diff={selectedItem.diff} />
        <SelectionSection selection={selectedItem.selection} />
        <SelectionContentSection selectionContent={selectedItem.selectionContent} />
        {!selectedItem.diff && !selectedItem.selectionContent && !selectedItem.diffPending && (
          <InfoPanel>Docs are equal.</InfoPanel>
        )}
      </SplitViewColumn>
    </SplitView>
  );
};
