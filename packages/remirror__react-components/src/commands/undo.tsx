import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { HistoryExtension } from 'remirror/extensions';
import { useCommands, useHelpers } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type UndoProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const Undo = <T extends ElementType>({
  as,
  ...rest
}: UndoProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { undo } = useCommands<HistoryExtension>();
  const { undoDepth } = useHelpers<HistoryExtension>(true);

  const handleSelect = useCallback(() => {
    if (undo.enabled()) {
      undo();
    }
  }, [undo]);

  const enabled = undoDepth() > 0;

  return (
    <Component
      {...rest}
      commandName='undo'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
