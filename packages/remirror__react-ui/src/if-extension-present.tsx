import React, { FC, ReactNode } from 'react';
import { AnyExtensionConstructor } from '@remirror/core';
import { useHasExtension } from '@remirror/react-core';

export interface IfExtensionPresentProps {
  extension: AnyExtensionConstructor;
  children?: ReactNode;
}

export const IfExtensionPresent: FC<IfExtensionPresentProps> = ({ children, extension }) => {
  const hasExtension = useHasExtension(extension);

  return hasExtension ? <>{children}</> : null;
};
