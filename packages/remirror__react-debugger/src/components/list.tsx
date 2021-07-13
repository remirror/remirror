import styled from '@emotion/styled';
import { ReactNode, useCallback, useState } from 'react';
import { assert, isArray, noop } from '@remirror/core';
import { Icon } from '@remirror/react';

import { mainTheme } from '../debugger-constants';

interface ListItemProps {
  isDimmed: boolean;
  isSelected: boolean;
  isPrevious: boolean;
  nested?: boolean;
  background?: (props: ListItemProps) => string;
}

export const ListItem = styled.div<ListItemProps>`
  min-width: 190px;
  width: 100%;
  display: flex;
  box-sizing: border-box;
  font-weight: 400;
  letter-spacing: 1px;
  font-size: 11px;
  color: ${mainTheme.white80};
  text-transform: uppercase;
  transition: background 0.3s;
  text-align: left;
  font-family: monospace;
  border: none;
  border-top: 1px solid ${mainTheme.main20};
  margin: 0;
  opacity: ${(props) => (props.isDimmed ? 0.3 : 1)};
  padding: ${(props) => (props.nested ? '6px 18px 6px 36px' : '6px 18px')};
  background: ${(props) =>
    props.background
      ? props.background(props)
      : props.isSelected
      ? mainTheme.main40
      : 'transparent'};

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: ${mainTheme.main40};
    color: ${mainTheme.white};
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: ${mainTheme.main60};
  }
`;

interface ListItemGroupContentProps {
  collapsed: boolean;
}

const ListItemGroupContent = styled.div<ListItemGroupContentProps>`
  display: ${(props) => (props.collapsed ? 'none' : 'block')};
`;

interface BaseListProps<Item = any> {
  groupTitle?: (items: Item[], index: number) => ReactNode;
  title: (item: Item, index: number) => ReactNode;
  isSelected?: (item: Item, index: number, items: Item[]) => boolean;
  isPrevious?: (item: Item, index: number) => boolean;
  isDimmed?: (item: Item, index: number, items: Item[]) => boolean;
  getKey?: (item: Item) => string | number;
  onListItemClick?: (item: Item, index: number) => void;
  onListItemDoubleClick?: (item: Item, index: number) => void;
  customItemBackground?: (props: ListItemProps) => string;
}

interface ListItemGroupProps<Item = any> extends BaseListProps<Item> {
  items: Item[];
}

function fn() {
  return false;
}

interface ListIconProps {
  collapsed: boolean;
}

const ListIcon = (props: ListIconProps) => {
  return <Icon name={props.collapsed ? 'arrowRightSFill' : 'arrowDownSFill'} />;
};

export function ListItemGroup<Item = any>(props: ListItemGroupProps<Item>): JSX.Element {
  const {
    items,
    groupTitle,
    title,
    isSelected = fn,
    isPrevious = fn,
    isDimmed = fn,
    getKey = noop,
    onListItemClick = noop,
    onListItemDoubleClick = noop,
    customItemBackground,
  } = props;
  const [firstItem] = items;
  const [collapsed, setCollapsed] = useState(true);

  assert(firstItem);

  const toggle = useCallback(() => {
    setCollapsed((state) => !state);
  }, []);

  return (
    <div>
      <ListItem
        key={getKey(firstItem)}
        onClick={toggle}
        isSelected={items.some(isSelected) && collapsed}
        isPrevious={isPrevious(firstItem, 0) && collapsed}
        isDimmed={items.every(isDimmed)}
        background={customItemBackground}
      >
        <div style={{ flexGrow: 1 }}>{groupTitle?.(items, 0)}</div>
        <ListIcon collapsed={collapsed} />
      </ListItem>
      <ListItemGroupContent collapsed={collapsed}>
        {(items || []).map((item, index) => {
          return (
            <ListItem
              key={getKey(item)}
              nested={true}
              isSelected={isSelected(item, index, items)}
              isPrevious={isPrevious(item, index)}
              isDimmed={isDimmed(item, index, items)}
              background={customItemBackground}
              onClick={() => onListItemClick(item, index)}
              onDoubleClick={() => onListItemDoubleClick(item, index)}
            >
              {title(item, index)}
            </ListItem>
          );
        })}
      </ListItemGroupContent>
    </div>
  );
}

interface ListProps<Item = any> extends BaseListProps<Item> {
  items: Item[];
}

export function List<Item = any>(props: ListProps<Item>): JSX.Element {
  const {
    items,
    isSelected = fn,
    isPrevious = fn,
    isDimmed = fn,
    getKey = noop,
    onListItemClick = noop,
    onListItemDoubleClick = noop,
    customItemBackground,
  } = props;
  return (
    <div>
      {(items || []).map((item, index) => {
        if (isArray(item)) {
          return <ListItemGroup {...props} items={items} key={item[0].timestamp} />;
        }

        return (
          <ListItem
            key={getKey(item)}
            isSelected={isSelected(item, index, items)}
            isPrevious={isPrevious(item, index)}
            isDimmed={isDimmed(item, index, items)}
            background={customItemBackground}
            onClick={() => onListItemClick(item, index)}
            onDoubleClick={() => onListItemDoubleClick(item, index)}
          >
            {props.title(item, index)}
          </ListItem>
        );
      })}
    </div>
  );
}
