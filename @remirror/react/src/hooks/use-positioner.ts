import { UsePositionerParams } from '../react-types';
import { useRemirror } from './use-remirror';

/**
 * A shorthand tool for retrieving the positioner props and adding them to a component.
 *
 * @remarks
 *
 * ```ts
 * import { bubblePositioner } from '@remirror/react';
 *
 * const MenuComponent: FC = () => {
 *   const { isActive, bottom, left } = usePositioner({positionerId: 'bubbleMenu', positioner: bubblePositioner })
 *
 *   return (
 *     <div style={{ bottom, left }}>
 *       <MenuIcon {...properties} />
 *     </div>
 *   );
 * }
 *
 * <RemirrorProvider extensions={[]}>
 *   <MenuComponent />
 * </RemirrorProvider>
 * ```
 *
 * @param params
 * @param params.positioner
 * @param params.positionerId
 * @param params.refKey
 */
export const usePositioner = <GRefKey extends string = 'ref'>({
  positioner,
  ...rest
}: UsePositionerParams<GRefKey>) => {
  const { getPositionerProps } = useRemirror();

  return getPositionerProps<GRefKey>({ ...positioner, ...rest });
};
