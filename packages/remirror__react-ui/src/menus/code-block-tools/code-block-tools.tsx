import React, { CSSProperties } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { cx, findParentNodeOfType, isElementDomNode } from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { PositionerPortal } from '@remirror/react-components';
import { usePositioner } from '@remirror/react-hooks';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

import { UiThemeProvider } from '../../providers/ui-theme-provider';
import { FormatButton, FormatButtonProps } from './format-button';
import { LanguageSelect, LanguageSelectProps } from './language-select';

type LanguageSelectUserProps =
  | {
      enableLanguageSelect: true;
      languageSelectOptions?: Omit<LanguageSelectProps, 'positioner'>;
    }
  | {
      enableLanguageSelect?: false;
      languageSelectOptions?: never;
    };

type FormatButtonUserProps =
  | {
      enableFormatButton: true;
      formatButtonOptions?: Omit<FormatButtonProps, 'positioner'>;
    }
  | {
      enableFormatButton?: false;
      formatButtonOptions?: never;
    };

export type CodeBlockToolsProps = {
  position?: 'left' | 'right';
  offset?: { x: number; y: number };
  className?: string;
} & LanguageSelectUserProps &
  FormatButtonUserProps;

export const CodeBlockTools = ({
  position = 'right',
  offset = { x: 0, y: 0 },
  className = '',
  enableLanguageSelect = true,
  languageSelectOptions = {},
  enableFormatButton = false,
  formatButtonOptions = {},
}: CodeBlockToolsProps): JSX.Element | null => {
  const positioner = usePositioner<FindProsemirrorNodeResult>(createPositioner, []);
  const { ref, x, y, width, active } = positioner;

  return (
    <UiThemeProvider>
      <PositionerPortal>
        {active && (
          <div
            ref={ref}
            className={cx(ExtensionCodeBlockTheme.CODE_BLOCK_TOOLS_POSITIONER, className)}
            style={
              {
                '--x': position === 'right' ? `${x + width + offset.x}px` : `${x + offset.x}px`,
                '--y': `${y + offset.y}px`,
                '--translate-x': position === 'right' ? '-100%' : '0',
                display: 'flex',
              } as CSSProperties
            }
          >
            {enableFormatButton && (
              <FormatButton positioner={positioner} {...formatButtonOptions} />
            )}
            {enableLanguageSelect && (
              <LanguageSelect positioner={positioner} {...languageSelectOptions} />
            )}
          </div>
        )}
      </PositionerPortal>
    </UiThemeProvider>
  );
};

function createPositioner(): Positioner<FindProsemirrorNodeResult> {
  return Positioner.create<FindProsemirrorNodeResult>({
    getActive(props) {
      const { selection, schema } = props.state;
      const parent = findParentNodeOfType({
        selection,
        types: schema.nodes.codeBlock,
      });

      if (!parent) {
        return Positioner.EMPTY;
      }

      return [parent];
    },

    getPosition(props) {
      const { data, view } = props;
      const node = view.nodeDOM(data.pos);

      if (!isElementDomNode(node)) {
        return defaultAbsolutePosition;
      }

      const rect = node.getBoundingClientRect();
      const editorRect = view.dom.getBoundingClientRect();
      const left = view.dom.scrollLeft + rect.left - editorRect.left;
      const top = view.dom.scrollTop + rect.top - editorRect.top;

      return {
        x: left - 1,
        y: top - 1,
        width: rect.width,
        height: rect.height,
        rect,
        visible: isPositionVisible(rect, view.dom),
      };
    },

    hasChanged: hasStateChanged,
  });
}
