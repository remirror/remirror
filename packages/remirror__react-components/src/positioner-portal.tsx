import React, { FC, ReactChild } from 'react';
import { createPortal } from 'react-dom';
import { useHelpers } from '@remirror/react-core';

export interface PositionerComponentProps {
  children: ReactChild;
}

/**
 * Render a component into the editors positioner widget using `createPortal`
 * from `react-dom`.
 */
export const PositionerPortal: FC<PositionerComponentProps> = (props) => {
  const container = useHelpers().getPositionerWidget();

  return createPortal(<>{props.children}</>, container);
};
