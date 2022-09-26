import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type IncreaseIndentProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const IncreaseIndent = <T extends ElementType>({
  as,
  ...rest
}: IncreaseIndentProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { increaseIndent } = useCommands<NodeFormattingExtension>();

  const handleSelect = useCallback(() => {
    if (increaseIndent.enabled()) {
      increaseIndent();
    }
  }, [increaseIndent]);

  const enabled = increaseIndent.enabled();

  return (
    <Component
      {...rest}
      commandName='increaseIndent'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
