import React, { CSSProperties } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType, isElementDomNode } from '@remirror/core';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { PositionerPortal } from '@remirror/react-components';
import { useCommands, useRemirrorContext } from '@remirror/react-core';
import { usePositioner } from '@remirror/react-hooks';

export interface CodeBlockFormatProps {
  className?: string;
  text?: string;
  offset?: { x: number; y: number };
}

interface CodeBlockPositionerData {
  codeBlockResult: FindProsemirrorNodeResult;
}

export const CodeBlockFormatCode = ({
  className = '',
  text = 'Format',
  offset = { x: 0, y: 0 },
}: CodeBlockFormatProps): JSX.Element => {
  const position = usePositioner(createPositioner, []);
  const { getState } = useRemirrorContext();
  const { focus, formatCodeBlock } = useCommands();
  const { selection } = getState();

  const nodeLanguage = findParentNodeOfType({
    selection,
    types: 'codeBlock',
  })?.node.attrs.language;

  return (
    <PositionerPortal>
      <button
        ref={position.ref}
        className={className}
        onClick={() => {
          formatCodeBlock();
          focus();
        }}
        style={
          {
            '--x': `${position.x + offset.x}px`,
            '--y': `${position.y + offset.y}px`,
            display: !nodeLanguage ? 'none' : 'block',
          } as CSSProperties
        }
      >
        {text || 'Format'}
      </button>
    </PositionerPortal>
  );
};

function createPositioner(): Positioner<CodeBlockPositionerData> {
  return Positioner.create<CodeBlockPositionerData>({
    getActive(props) {
      const { selection } = props.state;
      const codeBlockResult = findParentNodeOfType({
        selection,
        types: 'codeBlock',
      });

      if (codeBlockResult) {
        const positionerData: CodeBlockPositionerData = {
          codeBlockResult,
        };
        return [positionerData];
      }

      return Positioner.EMPTY;
    },

    getPosition(props) {
      const { data, view } = props;

      const { pos } = data.codeBlockResult;

      const firstCellDOM = view.nodeDOM(pos);

      if (!firstCellDOM || !isElementDomNode(firstCellDOM)) {
        return defaultAbsolutePosition;
      }

      const rect = firstCellDOM.getBoundingClientRect();
      const editorRect = view.dom.getBoundingClientRect();
      const left = view.dom.scrollLeft + rect.left - editorRect.left;
      const top = view.dom.scrollTop + rect.top - editorRect.top;
      const visible = isPositionVisible(rect, view.dom);

      return {
        height: 0,
        rect,
        visible,
        width: 0,
        x: left,
        y: top,
      };
    },

    hasChanged: hasStateChanged,
  });
}
