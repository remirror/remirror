import { useContext } from 'react';
import { RemirrorContext } from './provider';
import { UsePositionerParams } from './types';

/**
 * This provides access to the Remirror Editor context using hooks.
 *
 * ```ts
 * import { RemirrorProvider, useRemirror } from 'remirror';
 *
 * // ...
 *
 * function HooksComponent(props) {
 *   // This pull the remirror props out from the context.
 *   const { getPositionerProps } = useRemirror();
 *
 *   // ...
 *   return <Menu {...getPositionerProps()} />;
 * }
 *
 * class App extends Component {
 *   // ...
 *   render() {
 *     return (
 *       <RemirrorProvider>
 *         <HooksComponent />
 *       </RemirrorProvider>
 *     );
 *   }
 * }
 * ```
 */
export const useRemirrorContext = () => {
  return useContext(RemirrorContext);
};

/**
 * Hooks to receive the positioner props and add them to your component
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
 *       // ...
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
  const { getPositionerProps } = useRemirrorContext();

  return getPositionerProps<GRefKey>({ ...positioner, ...rest });
};
