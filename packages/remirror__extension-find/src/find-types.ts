import type { FromToProps } from '@remirror/core';

export interface FindResult {
  /**
   * The index of search result to highlight. Undefined if no search result is
   * active.
   */
  activeIndex: number | undefined;

  /**
   * The absolute position ranges of all search result.
   */
  ranges: FromToProps[];
}

export interface FindProps {
  /**
   * The text to search for.
   */
  query: string;

  /**
   * @defaultValue false (search is case insensitive)
   */
  caseSensitive?: boolean;

  /**
   * The index of search result to highlight. If not provided, none will be
   * highlighted.
   */
  activeIndex?: number;
}

export interface FindAndReplaceProps {
  /**
   * The text to search for.
   */
  query: string;

  /**
   * @defaultValue false (search is case insensitive)
   */
  caseSensitive?: boolean;

  /**
   * The text to replace.
   */
  replacement: string;

  /**
   * The index of search result to highlight. If not provided, the active one
   * will be replace.
   */
  index?: number;
}

export interface FindAndReplaceAllProps {
  /**
   * The text to search for.
   */
  query: string;

  /**
   * @defaultValue false (search is case insensitive)
   */
  caseSensitive?: boolean;

  /**
   * The text to replace.
   */
  replacement: string;
}
