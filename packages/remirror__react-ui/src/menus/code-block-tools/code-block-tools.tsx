import React, { CSSProperties, useMemo } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { cx } from '@remirror/core';
import { codeBlockPositioner } from '@remirror/extension-code-block';
import { PositionerPortal } from '@remirror/react-components';
import { usePositioner } from '@remirror/react-hooks';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

import { UiThemeProvider } from '../../providers/ui-theme-provider';

export interface CodeBlockToolsProps {
  position?: 'left' | 'right';
  offset?: { x: number; y: number };
  className?: string;
  children: React.ReactNode | React.ReactNode[];
}

export const CodeBlockTools = ({
  position = 'right',
  offset = { x: 0, y: 0 },
  className = '',
  children,
}: CodeBlockToolsProps): JSX.Element | null => {
  const positioner = usePositioner<FindProsemirrorNodeResult>(codeBlockPositioner, []);
  const { ref, x, y, width, active } = positioner;
  const { x: offsetX, y: offsetY } = offset;

  const styles: CSSProperties = useMemo(() => {
    if (!active) {
      return { display: 'none' };
    }

    return {
      '--x': position === 'right' ? `${x + width + offsetX}px` : `${x + offsetX}px`,
      '--y': `${y + offsetY}px`,
      '--translate-x': position === 'right' ? '-100%' : '0',
      display: 'flex',
    };
  }, [active, x, y, width, position, offsetX, offsetY]);

  return (
    <UiThemeProvider>
      <PositionerPortal>
        <div
          ref={ref}
          className={cx(ExtensionCodeBlockTheme.CODE_BLOCK_TOOLS_POSITIONER, className)}
          style={styles}
        >
          {children}
        </div>
      </PositionerPortal>
    </UiThemeProvider>
  );
};
