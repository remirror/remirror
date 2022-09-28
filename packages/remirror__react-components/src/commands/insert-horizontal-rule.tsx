import React, { ComponentPropsWithoutRef, ElementType, ReactElement, useCallback } from 'react';
import { HorizontalRuleExtension } from 'remirror/extensions';
import { useCommands, useCurrentSelection } from '@remirror/react-core';

import { CommandButton } from '../base-components';

export type InsertHorizontalRuleProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'commandName' | 'active' | 'enabled' | 'attrs' | 'onSelect'>;

export const InsertHorizontalRule = <T extends ElementType>({
  as,
  ...rest
}: InsertHorizontalRuleProps<T>): ReactElement => {
  const Component = as || CommandButton;

  const { insertHorizontalRule } = useCommands<HorizontalRuleExtension>();
  // Force component update on selection change
  useCurrentSelection();

  const handleSelect = useCallback(() => {
    if (insertHorizontalRule.enabled()) {
      insertHorizontalRule();
    }
  }, [insertHorizontalRule]);

  const enabled = insertHorizontalRule.enabled();

  return (
    <Component
      {...rest}
      commandName='insertHorizontalRule'
      enabled={enabled}
      onSelect={handleSelect}
    />
  );
};
