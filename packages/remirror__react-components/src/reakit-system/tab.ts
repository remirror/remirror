import { TabHTMLProps, TabOptions } from 'reakit/Tab/Tab';
import { TabListHTMLProps, TabListOptions } from 'reakit/Tab/TabList';
import { cx } from '@remirror/core';
import { ComponentsTheme } from '@remirror/theme';

import { BootstrapRoleOptions } from './role';

export type BootstrapTabOptions = BootstrapRoleOptions & TabOptions;

export function useTabProps(_: BootstrapTabOptions, htmlProps: TabHTMLProps = {}): TabHTMLProps {
  return { ...htmlProps, className: cx(ComponentsTheme.TAB, htmlProps.className) };
}

export type BootstrapTabListOptions = BootstrapRoleOptions & TabListOptions;

export function useTabListProps(
  _: BootstrapTabListOptions,
  htmlProps: TabListHTMLProps = {},
): TabListHTMLProps {
  return { ...htmlProps, className: cx(htmlProps.className, ComponentsTheme.TAB_LIST) };
}
