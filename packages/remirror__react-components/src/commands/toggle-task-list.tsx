import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { TaskListExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleTaskListProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleTaskList = <T extends ElementType>({
  as,
  ...rest
}: ToggleTaskListProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleTaskList } = useCommands<TaskListExtension>();

  const handleSelect = useCallback(() => {
    if (toggleTaskList.enabled()) {
      toggleTaskList();
    }
  }, [toggleTaskList]);

  const active = useActive<TaskListExtension>().taskList();
  const enabled = toggleTaskList.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleTaskList'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
