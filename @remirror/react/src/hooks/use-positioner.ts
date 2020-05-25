import { UsePositionerParameter } from '../react-types';
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
 *   const {
 *     isActive,
 *     bottom,
 *     left
 * } = usePositioner({positionerId: 'bubbleMenu', positioner: bubblePositioner });
 *
 *   return (
 *     <div style={{ bottom, left }}>
 *       <MenuIcon {...options} />
 *     </div>
 *   );
 * }
 *
 * <RemirrorProvider extensions={[]}>
 *   <MenuComponent />
 * </RemirrorProvider>
 * ```
 */
export const usePositioner = <Ref extends string = 'ref'>({
  positioner,
  ...rest
}: UsePositionerParameter<Ref>) => {
  const { getPositionerProps } = useRemirror();

  return getPositionerProps<Ref>({ ...positioner, ...rest });
};
