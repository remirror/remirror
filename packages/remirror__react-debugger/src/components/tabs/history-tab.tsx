import styled from '@emotion/styled';
import { Delta } from 'jsondiffpatch';
import { assertGet, isArray, isNumber } from '@remirror/core';

import { mainTheme } from '../../debugger-constants';
import { useDebuggerStore } from '../../debugger-state';
import { HistoryEntry } from '../../debugger-types';
import { Highlighter } from '../highlighter';
import { JsonDiff } from '../json-diff';
import { List } from '../list';
import { Heading, InfoPanel, SplitView, SplitViewColumn } from '../styled';

function pad(num: number) {
  return `00${num}`.slice(-2);
}

function pad3(num: number) {
  return `000${num}`.slice(-3);
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    pad3(date.getMilliseconds()),
  ].join(':');
};

const SelectionContentSection = (props: { selectionContent: string }) => {
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

const DocDiffSection = (props: { diff: any }) => {
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

const SelectionSection = (props: { selection: Delta | undefined }) => {
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

type WithIndex<Type> = Type & { index: number };

export const HistoryTab = (): JSX.Element => {
  type HistoryWithIndex = WithIndex<HistoryEntry>;
  type ListedHistoryEntry = HistoryWithIndex | HistoryWithIndex[];
  const { actions, historyRolledBackTo, history, selectedHistoryIndex } = useDebuggerStore();
  const previousItem = history[selectedHistoryIndex + 1];
  const selectedItem = assertGet(history, selectedHistoryIndex);
  const historyRolledBackToItem = isNumber(historyRolledBackTo)
    ? history[historyRolledBackTo]
    : undefined;
  const historyList: ListedHistoryEntry[] = [];

  for (const [index, entry] of history.entries()) {
    const previous = historyList[index];
    const item = { ...entry, index };

    if (item.diff) {
      historyList.push();
      continue;
    }

    if (!isArray(previous)) {
      historyList.push([item]);
      continue;
    }

    historyList.push(item);
  }

  for (const [index, item] of historyList.entries()) {
    if (isArray(item) && item.length === 1) {
      historyList[index] = assertGet(item, 0);
    }
  }

  const getItem = (item: ListedHistoryEntry) => (isArray(item) ? assertGet(item, 0) : item);
  const isSelected = (item: ListedHistoryEntry) =>
    getItem(item).timestamp === selectedItem.timestamp;
  const isPrevious = (item: ListedHistoryEntry) =>
    !!previousItem && getItem(item).timestamp === previousItem.timestamp;
  const isDimmed = (item: ListedHistoryEntry) =>
    !!historyRolledBackToItem && getItem(item).timestamp > historyRolledBackToItem.timestamp;

  return (
    <SplitView>
      <SplitViewColumn removePadding minWidth={190}>
        <List
          items={historyList}
          getKey={(item) => getItem(item).timestamp}
          title={(item) => formatTimestamp(getItem(item).timestamp)}
          groupTitle={(item) => {
            return `${formatTimestamp(getItem(assertGet(item, 0)).timestamp)} [${item.length}]`;
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
          onListItemClick={(item) => actions.selectHistoryItem(getItem(item).index)}
          onListItemDoubleClick={(item) => actions.rollbackHistory(getItem(item).index)}
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

const Section = styled.div`
  min-width: 180px;
  box-sizing: border-box;

  & + & {
    padding-top: 9px;
  }
`;
