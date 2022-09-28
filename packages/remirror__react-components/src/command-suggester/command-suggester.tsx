import { MenuList, Paper } from '@mui/material';
import { matchSorter } from 'match-sorter';
import React, {
  Children,
  FC,
  isValidElement,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react';
import type { PositionerParam } from '@remirror/extension-positioner';
import { useCommands } from '@remirror/react-core';
import { useSuggest } from '@remirror/react-hooks';

import { FloatingWrapper } from "../floating-menu";
import { CommandInformation, CommandSuggesterContext } from './command-suggester-context';

export type CommandSuggestorItem = Pick<CommandInformation, 'commandId'>;

export interface CommandSuggesterProps {
  children: Array<ReactElement<CommandSuggestorItem>>;
  positioner?: PositionerParam;
}

export const CommandSuggester: FC<CommandSuggesterProps> = ({
  children,
  positioner = 'cursor',
}) => {
  const { delete: deleteRange } = useCommands();
  const [commands, setCommands] = useState<CommandInformation[]>([]);

  const addCommand = useCallback((command: CommandInformation) => {
    const exists = commands.find(c => c.commandId === command.commandId);

    if (!exists) {
      setCommands([
        ...commands,
        command
      ])
    }
  }, [commands]);

  const values = useMemo(() => ({
    addCommand
  }), [addCommand])

  const { change, ...rest } = useSuggest({ char: '/', name: 'command-suggester', matchOffset: 0 });
  const query = change?.query.full;

  const handleClick = useCallback(() => {
    if (change?.range) {
      deleteRange(change.range);
    }
  }, [deleteRange, change])

  console.log('change', change)
  console.log('rest', rest)

  const items =
    query
      ? matchSorter(commands, query, {
          keys: ['label', 'description', (item) => item.description?.replace(/\W/g, '') ?? ''],
          threshold: matchSorter.rankings.CONTAINS,
        })
      : commands

  const childrenArr = Children.toArray(children).filter(elem => {
    if (!isValidElement(elem)) {
      return false
    }

    return !!elem.props.commandId;
  }) as Array<ReactElement<CommandSuggestorItem>>;

  return (
    <CommandSuggesterContext.Provider value={values}>
      {commands.length !== childrenArr.length && children}
      <FloatingWrapper positioner={positioner} enabled={!!query} renderOutsideEditor>
        <Paper elevation={3}>
          <MenuList>
            {items.map(({ commandId }) => {
              const component = childrenArr.find(({ props }) => props.commandId === commandId);

              if (!component) {
                return null;
              }

              const { type: ComponentType, props } = component;
              return (
                <ComponentType key={props.commandId} {...props} />
              )
            })}
          </MenuList>
        </Paper>
      </FloatingWrapper>
    </CommandSuggesterContext.Provider>
  );
}
