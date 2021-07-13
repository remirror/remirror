import type { ValueOf } from '@remirror/core';

export const jsonTreeTheme = {
  scheme: 'monokai',
  base00: '#363755',
  base01: '#604D49',
  base02: '#6D5A55',
  base03: '#D1929B',
  base04: '#B79F8D',
  base05: '#F9F8F2',
  base06: '#F7F4F1',
  base07: '#FAF8F5',
  base08: '#FA3E7E',
  base09: '#FD993C',
  base0A: '#F6BF81',
  base0B: '#B8E248',
  base0C: '#B4EFE4',
  base0D: '#85D9EF',
  base0E: '#BE87FF',
  base0F: '#D6724C',
};

export const mainTheme = {
  main: '#ffa2b1',
  main20: 'rgba(255, 162, 177, .2)',
  main40: 'rgba(255, 162, 177, .4)',
  main60: 'rgba(255, 162, 177, .6)',
  main80: 'rgba(255, 162, 177, .8)',
  main90: 'rgba(255, 162, 177, .9)',
  mainBg: '#363755',
  softerMain: '#BB91A3',

  white: '#fff',
  white05: 'rgba(255, 255, 255, .05)',
  white10: 'rgba(255, 255, 255, .1)',
  white20: 'rgba(255, 255, 255, .2)',
  white60: 'rgba(255, 255, 255, .6)',
  white80: 'rgba(255, 255, 255, .8)',

  black30: 'rgba(0, 0, 0, .3)',

  // For diffs and structure
  lightYellow: '#FFF9C4',
  lightPink: '#FB4B85',
  darkGreen: '#81AF6D',

  syntax: jsonTreeTheme,
};

export const NODE_PICKER_DEFAULT = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  active: false,
};

export const HISTORY_SIZE = 200;

export const SNAPSHOTS_KEY = 'remirror-dev-tools-snapshots';

export const NODE_COLORS = [
  '#EA7C7F', // red
  '#67B0C6', // cyan 400
  '#94BB7F', // green
  '#CA9EDB', // deep purple
  '#DCDC5D', // lime
  '#B9CC7C', // light green
  '#DD97D8', // purple
  '#FFB761', // orange
  '#4D8FD1', // light blue
  '#F36E98', // pink
  '#E45F44', // deep orange
  '#A6A4AE', // blue grey
  '#FCC047', // yellow
  '#FFC129', // amber
  '#D3929C', // can can
  '#4CBCD4', // cyan
  '#8D7BC0', // indigo
] as const;

/**
 * An enum like object used to give the unique id's to the tabs.
 */
export const TabName = {
  JsonEditor: 'remirror-dev-json-editor-tab',
  History: 'remirror-dev-history-tab',
  Plugins: 'remirror-dev-plugins-tab',
  Schema: 'remirror-dev-schema-tab',
  Snapshots: 'remirror-dev-snapshots-tab',
  State: 'remirror-dev-state-tab',
  Structure: 'remirror-dev-Structure-tab',
} as const;

export type TabName = ValueOf<typeof TabName>;
