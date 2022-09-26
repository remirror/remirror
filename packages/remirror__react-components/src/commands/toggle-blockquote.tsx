import React, {ComponentPropsWithoutRef, ElementType, ReactElement, useCallback} from 'react';
import { BlockquoteExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleBlockquoteProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleBlockquote = <T extends ElementType>({
  as,
  ...rest
}: ToggleBlockquoteProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleBlockquote } = useCommands<BlockquoteExtension>();

  const handleSelect = useCallback(() => {
    if (toggleBlockquote.enabled()) {
      toggleBlockquote();
    }
  }, [toggleBlockquote]);

  const active = useActive<BlockquoteExtension>().blockquote();
  const enabled = toggleBlockquote.enabled();

  return (
    <Component
      {...rest}
      commandName='toggleBlockquote'
      active={active}
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
