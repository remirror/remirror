import { useCallback } from 'react';
import type { RemirrorJSON } from '@remirror/core';

import { useDocChanged, useHelpers } from './hooks';

export interface OnChangeJSONProps {
  onChange: (json: RemirrorJSON) => void;
}

export const OnChangeJSON = ({ onChange }: OnChangeJSONProps): null => {
  const { getJSON } = useHelpers();

  useDocChanged(
    useCallback(
      ({ state }) => {
        const json = getJSON(state);
        onChange(json);
      },
      [onChange, getJSON],
    ),
  );

  return null;
};

export interface OnChangeHTMLProps {
  onChange: (html: string) => void;
}

export const OnChangeHTML = ({ onChange }: OnChangeHTMLProps): null => {
  const { getHTML } = useHelpers();

  useDocChanged(
    useCallback(
      ({ state }) => {
        const html = getHTML(state);
        onChange(html);
      },
      [onChange, getHTML],
    ),
  );

  return null;
};
