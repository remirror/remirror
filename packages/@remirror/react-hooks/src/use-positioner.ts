import {
  emptyCoords,
  emptyVirtualPosition,
  Positioner,
  StringPositioner,
} from '@remirror/extension-positioner';

import { useMultiPositioner, UsePositionerReturn } from './use-multi-positioner';

/**
 * A hook for creating a positioner with the `PositionerExtension`. When an
 * active position exists for the provided positioner it will return an object
 * with the `ref`, `top`, `left`, `bottom`, `right` properties.
 *
 * @param isActive - Set this to a boolean to override whether the positioner is
 * active. `true` leaves the behaviour unchanged.
 *
 *
 * @remarks
 *
 * Must apply the ref to the component when called.
 *
 * ```ts
 * import { usePositioner } from 'remirror/react';
 *
 * const MenuComponent: FC = () => {
 *   const positions = usePositioner('bubble');
 *
 *   return (
 *     <div style={{ bottom, left }} ref={ref}>
 *       <MenuIcon {...options} />
 *     </div>
 *   );
 * }
 *
 * const Wrapper = () => (
 *   <RemirrorProvider extensions={[]}>
 *     <MenuComponent />
 *   </RemirrorProvider>
 * )
 * ```
 */
export function usePositioner(
  positioner: Positioner | StringPositioner,
  isActive = true,
): UsePositionerReturn {
  const positions = useMultiPositioner(positioner);

  if (positions.length > 0 && isActive) {
    return { ...positions[0], active: true };
  }

  return { ...emptyVirtualPosition, ...emptyCoords, active: false };
}
