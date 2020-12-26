import { cx } from '@linaria/core';
import { TabHTMLProps, TabOptions } from 'reakit/Tab/Tab';
import { TabListHTMLProps, TabListOptions } from 'reakit/Tab/TabList';

import { Components } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapTabOptions = BootstrapRoleOptions & TabOptions;

export function useTabProps(_: BootstrapTabOptions, htmlProps: TabHTMLProps = {}): TabHTMLProps {
  return { ...htmlProps, className: cx(Components.TAB, htmlProps.className) };
}

export type BootstrapTabListOptions = BootstrapRoleOptions & TabListOptions;

export function useTabListProps(
  _: BootstrapTabListOptions,
  htmlProps: TabListHTMLProps = {},
): TabListHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, Components.TAB_LIST) };
}
