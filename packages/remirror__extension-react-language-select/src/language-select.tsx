import memoize from 'lodash.memoize';
import React, {
  ChangeEvent,
  CSSProperties,
  PointerEvent,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CodeBlockExtension } from '@remirror/extension-code-block';
import {
  isPositionVisible,
  Positioner,
  defaultAbsolutePosition,
  hasStateChanged,
} from '@remirror/extension-positioner';
import type { FindProsemirrorNodeResult } from '@remirror/core';
import { findParentNodeOfType, isElementDomNode, uniqueBy } from '@remirror/core';
import { PositionerPortal } from '@remirror/react-components';
import { useCommands, useRemirrorContext } from '@remirror/react-core';
import { usePositioner } from '@remirror/react-hooks';

export interface CodeBlockLanguageSelectProps {
  className?: string;
  languages?: Array<{ displayName: string; value?: string }>;
  offset?: { x: number; y: number };
  onLanguageChange?: (
    language: string,
    element: HTMLElement | undefined,
    setWidth: (value: SetStateAction<string>) => void,
  ) => boolean;
  onPointerDownSelect?: (event: PointerEvent<HTMLSelectElement>) => boolean;
  onSelectChange?: (
    event: ChangeEvent<HTMLSelectElement>,
    setWidth: (value: SetStateAction<string>) => void,
  ) => boolean;
}

interface CodeBlockPositionerData {
  codeBlockResult: FindProsemirrorNodeResult;
}

export const CodeBlockLanguageSelect = ({
  languages = [],
  className = '',
  offset = { x: 0, y: 0 },
  onLanguageChange,
  onPointerDownSelect,
  onSelectChange,
}: CodeBlockLanguageSelectProps): JSX.Element => {
  const position = usePositioner(createPositioner, []);
  const { getExtension, getState } = useRemirrorContext();
  const { focus, updateCodeBlock } = useCommands();

  const languageOptions = getExtension(CodeBlockExtension).options;

  const [aliasesMap] = useState(() => {
    const temp = new Map();

    languageOptions.supportedLanguages.forEach((lang) => {
      lang.aliases.forEach(
        (alias) =>
          !languages.some((lang) => lang.displayName === alias) &&
          temp.set(alias, lang.displayName),
      );
    });
    return temp;
  });

  const [lang] = useState([
    ...languages,
    {
      displayName: languageOptions.defaultLanguage,
    },
    ...languageOptions.supportedLanguages,
  ]);

  const { selection } = getState();

  const [width, setWidth] = useState('auto');

  const nodeLanguage = findParentNodeOfType({
    selection,
    types: 'codeBlock',
  })?.node.attrs.language;

  const language = useMemo(() => {
    const alias = aliasesMap.get(nodeLanguage);

    if (alias) {
      return alias;
    }

    if (languageOptions.supportedLanguages.some((lang) => nodeLanguage === lang.displayName)) {
      return nodeLanguage;
    }

    return languageOptions.defaultLanguage;
  }, [
    aliasesMap,
    languageOptions.defaultLanguage,
    languageOptions.supportedLanguages,
    nodeLanguage,
  ]);

  useEffect(() => {
    const el = position.element;

    if (onLanguageChange?.(language, el, setWidth)) {
      return;
    }

    const isSelectElement = (n?: HTMLElement): n is HTMLSelectElement =>
      (n && n.nodeName === 'SELECT') || false;

    if (isSelectElement(el)) {
      const width = el.options[el.selectedIndex]?.dataset.width;
      setWidth(width ? `${width}px` : 'auto');
    }
  }, [position.element, language, onLanguageChange]);

  return (
    <PositionerPortal>
      <select
        ref={position.ref}
        className={className}
        onBlur={() => focus()}
        onChange={(e) => {
          if (onSelectChange?.(e, setWidth)) {
            return;
          }

          setWidth(`${e.target.options[e.target.selectedIndex]?.dataset.width}px`);

          updateCodeBlock({
            language: e.target.dataset.value || e.target.value,
          });
        }}
        onPointerDown={onPointerDownSelect}
        style={
          {
            '--w': width,
            '--x': `${position.x + offset.x}px`,
            '--y': `${position.y + offset.y}px`,
            display: !nodeLanguage ? 'none' : 'block',
          } as CSSProperties
        }
        value={language}
      >
        {nodeLanguage ? getLanguageOptions(lang) : null}
      </select>
    </PositionerPortal>
  );
};

const getLanguageOptions = memoize((input: Array<{ displayName: string; value?: string }>) => {
  const options = uniqueBy(
    input.map(({ displayName, value }) => ({
      displayName,
      value: value || displayName,
    })),
    'displayName',
  )
    .sort((a, b) => {
      if (a.displayName > b.displayName) {
        return 1;
      }

      if (a.displayName < b.displayName) {
        return -1;
      }

      return 0;
    })
    .map((o) => {
      const select = document.createElement('select');
      const option = document.createElement('option');
      let width = '0px';

      select.append(option);

      document.body.append(select);

      option.textContent = o.displayName;

      width = String(select.getBoundingClientRect().width);

      select.remove();

      return { ...o, width };
    })
    .map(({ displayName, value, width }) => (
      <option key={displayName} data-value={value} data-width={width} value={displayName}>
        {displayName}
      </option>
    ));

  return options;
});

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
