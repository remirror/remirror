import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { CodeBlockAttributes, CodeBlockExtension } from 'remirror/extensions';
import { useActive, useCommands } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type ToggleCodeBlockProps<T extends ElementType> = {
  attrs?: Partial<CodeBlockAttributes>;
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const ToggleCodeBlock = <T extends ElementType>({
  as,
  attrs = {},
  ...rest
}: ToggleCodeBlockProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { toggleCodeBlock } = useCommands<CodeBlockExtension>();

  const handleSelect = useCallback(() => {
    if (toggleCodeBlock.enabled(attrs)) {
      toggleCodeBlock(attrs);
    }
  }, [toggleCodeBlock, attrs]);

  const active = useActive<CodeBlockExtension>().codeBlock(attrs);
  const enabled = toggleCodeBlock.enabled(attrs);

  return (
    <Component
      {...rest}
      commandName='toggleCodeBlock'
      active={active}
      enabled={enabled}
      attrs={attrs}
      onSelect={handleSelect}
    />
  );
};
