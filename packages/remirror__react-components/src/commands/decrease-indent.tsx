import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { NodeFormattingExtension } from 'remirror/extensions';
import { useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type DecreaseIndentProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const DecreaseIndent = <T extends ElementType>({
  as,
  ...rest
}: DecreaseIndentProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { decreaseIndent } = useCommands<NodeFormattingExtension>();

  const handleSelect = useCallback(() => {
    if (decreaseIndent.enabled()) {
      decreaseIndent();
    }
  }, [decreaseIndent]);

  const enabled = decreaseIndent.enabled();

  return (
    <Component
      {...rest}
      commandName='decreaseIndent'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
