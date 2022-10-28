import type { FromToProps } from '@remirror/core';

export interface SearchResult {
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

export interface StartSearchOptions {
  /**
   * The text to search for.
   */
  searchTerm: string;

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

export interface ReplaceOptions {
  /**
   * The text to search for.
   */
  searchTerm: string;

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

export interface ReplaceAllOptions {
  /**
   * The text to search for.
   */
  searchTerm: string;

  /**
   * @defaultValue false (search is case insensitive)
   */
  caseSensitive?: boolean;

  /**
   * The text to replace.
   */
  replacement: string;
}
