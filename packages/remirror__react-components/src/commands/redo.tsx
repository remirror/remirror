import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { HistoryExtension } from 'remirror/extensions';
import { useCommands, useHelpers } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type RedoProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const Redo = <T extends ElementType>({ as, ...rest }: RedoProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { redo } = useCommands<HistoryExtension>();
  const { redoDepth } = useHelpers<HistoryExtension>(true);

  const handleSelect = useCallback(() => {
    if (redo.enabled()) {
      redo();
    }
  }, [redo]);

  const enabled = redoDepth() > 0;

  return (
    <Component
      {...rest}
      commandName='redo'
      active={false}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
