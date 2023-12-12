import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import React, { CSSProperties, PointerEvent, useEffect, useMemo } from 'react';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType, isElementDomNode, uniqueBy } from '@remirror/core';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import {
  defaultAbsolutePosition,
  hasStateChanged,
  isPositionVisible,
  Positioner,
} from '@remirror/extension-positioner';
import { PositionerPortal } from '@remirror/react-components';
import { useCommands, useExtension } from '@remirror/react-core';
import { usePositioner } from '@remirror/react-hooks';
import { ExtensionCodeBlockTheme } from '@remirror/theme';

import { UiThemeProvider } from '../providers/ui-theme-provider';

export interface CodeBlockLanguageSelectProps {
  languages?: Array<{ displayName: string; value?: string }>;
  onLanguageChange?: (language: string, element: HTMLElement | undefined) => boolean;
  position?: 'left' | 'right';
  offset?: { x: number; y: number };
  onPointerDownSelect?: (event: PointerEvent<HTMLDivElement>) => boolean;
  onSelectChange?: (event: SelectChangeEvent) => boolean;
  className?: string;
}

export const CodeBlockLanguageSelect = ({
  languages = [],
  onLanguageChange,
  position = 'right',
  offset = { x: 0, y: 0 },
  onPointerDownSelect,
  onSelectChange,
  className = '',
}: CodeBlockLanguageSelectProps): JSX.Element | null => {
  const { ref, element, x, y, width, data, active } = usePositioner<FindProsemirrorNodeResult>(
    createPositioner,
    [],
  );
  const { focus, updateCodeBlock } = useCommands();

  const { defaultLanguage, supportedLanguages } = useExtension(CodeBlockExtension).options;
  const currentNodeLanguage: string | undefined = active ? data.node.attrs.language : undefined;

  const languageAliases: Map<string, string> = useMemo(() => {
    const result: Map<string, string> = new Map();

    const languagesDisplayNames = new Set(languages.map((lang) => lang.displayName));

    for (const { displayName, aliases } of supportedLanguages) {
      for (const alias of aliases) {
        if (!languagesDisplayNames.has(alias)) {
          result.set(alias, displayName);
        }
      }
    }

    return result;
  }, [supportedLanguages, languages]);

  const languageOptions = useMemo(() => {
    const allLanguages: Array<{ displayName: string; value?: string }> = [
      ...languages,
      {
        displayName: defaultLanguage,
      },
      ...supportedLanguages,
    ];

    return uniqueBy(allLanguages, (lang) => lang.displayName).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }, [languages, defaultLanguage, supportedLanguages]);

  const currentDisplayLanguage = useMemo(() => {
    if (!currentNodeLanguage) {
      return defaultLanguage;
    }

    const alias = languageAliases.get(currentNodeLanguage);

    if (alias) {
      return alias;
    }

    if (languageOptions.some((lang) => lang.displayName === currentNodeLanguage)) {
      return currentNodeLanguage;
    }

    return defaultLanguage;
  }, [languageAliases, languageOptions, defaultLanguage, currentNodeLanguage]);

  useEffect(() => {
    onLanguageChange?.(currentDisplayLanguage, element);
  }, [onLanguageChange, currentDisplayLanguage, element]);

  const handleChange = (e: SelectChangeEvent) => {
    if (onSelectChange?.(e)) {
      return;
    }

    updateCodeBlock({
      language: e.target.value,
    });
  };

  return (
    <UiThemeProvider>
      <PositionerPortal>
        {active && (
          <div
            ref={ref}
            className={ExtensionCodeBlockTheme.LANGUAGE_SELECT_POSITIONER}
            style={
              {
                '--x': position === 'right' ? `${x + width + offset.x}px` : `${x + offset.x}px`,
                '--y': `${y + offset.y}px`,
                '--translate-x': position === 'right' ? '-100%' : '0',
              } as CSSProperties
            }
          >
            <FormControl margin='none' size='small' sx={{ m: 1 }} className={className}>
              <Select
                sx={{
                  bgcolor: 'background.paper',
                }}
                onBlur={() => focus()}
                onChange={handleChange}
                onPointerDown={onPointerDownSelect}
                value={currentDisplayLanguage}
                autoWidth
              >
                {languageOptions.map(({ displayName, value }) => (
                  <MenuItem key={displayName} value={value ?? displayName}>
                    {displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
