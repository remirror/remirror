import { CompositeItemHTMLProps, CompositeItemOptions } from 'reakit/Composite/CompositeItem';

import { BootstrapRoleOptions } from './role';

export type BootstrapCompositeItemOptions = BootstrapRoleOptions & CompositeItemOptions;

export function useCompositeItemOptions({
  unstable_system: { fill = 'opaque', palette = 'primary', ...system } = {},
  ...options
}: BootstrapCompositeItemOptions): BootstrapCompositeItemOptions {
  return { unstable_system: { fill, palette, ...system }, ...options };
}

export function useCompositeItemProps(
  _: BootstrapCompositeItemOptions,
  htmlProps: CompositeItemHTMLProps = {},
): CompositeItemHTMLProps {
  return {
    ...htmlProps,
    // className: cx(Components.COMPOSITE, htmlProps.className),
  };
}
