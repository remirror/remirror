import { useMemo, useRef } from 'react';
import { isBoolean, MakeOptional, uniqueId } from '@remirror/core';
import {
  CallbackPositioner,
  defaultAbsolutePosition,
  Positioner,
  PositionerParam,
  StringPositioner,
} from '@remirror/extension-positioner';

import { useMultiPositioner, UseMultiPositionerReturn } from './use-multi-positioner';

export interface UsePositionerReturn extends MakeOptional<UseMultiPositionerReturn, 'ref'> {
  /**
   * When `true`, the position is active and the positioner will be displayed.
   */
  active: boolean;
}

/**
 * A hook for creating a positioner with the `PositionerExtension`. When an
 * active position exists for the provided positioner it will return an object
 * with the `ref`, `top`, `left`, `bottom`, `right` properties.
 *
 * @param isActive - Set this to a boolean to override whether the positioner is
 * active. `true` leaves the behaviour unchanged.
 *
 * In a recent update, the positioner is now automatically memoized for you.
 *
 *
 * @remarks
 *
 * Must apply the ref to the component when called.
 *
 * ```ts
 * import { usePositioner } from '@remirror/react';
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
 *   <Remirror extensions={[]}>
 *     <MenuComponent />
 *   </Remirror>
 * )
 * ```
 *
 * @param positioner - the positioner to use which can be a string or a
 * `Positioner` instance.
 * @param activeOrDeps - the dependency array which will cause the positioner to
 * be updated when changed or a boolean value when the positioner is a string
 * which can be used to override whether the positioner is active.
 */
export function usePositioner(
  positioner: StringPositioner,
  isActive?: boolean,
): UsePositionerReturn;
export function usePositioner(
  positioner: Positioner | CallbackPositioner,
  deps: unknown[],
): UsePositionerReturn;
export function usePositioner(
  positioner: PositionerParam,
  activeOrDeps?: unknown[] | boolean,
): UsePositionerReturn {
  const deps = activeOrDeps == null || isBoolean(activeOrDeps) ? [positioner] : activeOrDeps;
  const isActive = isBoolean(activeOrDeps) ? activeOrDeps : true;
  const key = useRef(uniqueId());
  const positions = useMultiPositioner(positioner, deps);
  const position = positions[0];

  return useMemo(() => {
    if (position && isActive) {
      return { ...position, active: true };
    }

    return { ...defaultAbsolutePosition, active: false, key: key.current };
  }, [isActive, position]);
}
