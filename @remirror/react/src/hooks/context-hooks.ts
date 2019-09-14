import { AnyExtension, ExtensionManager } from '@remirror/core';
import { useContext } from 'react';
import { RemirrorContext, RemirrorManagerContext } from '../react-contexts';
import { InjectedRemirrorProps, UsePositionerParams } from '../react-types';

/**
 * This provides access to the Remirror Editor context using hooks.
 *
 * ```ts
 * import { RemirrorProvider, useRemirrorContext } from 'remirror';
 *
 * function HooksComponent(props) {
 *   // This pull the remirror props out from the context.
 *   const { getPositionerProps } = useRemirrorContext();
 *
 *   return <Menu {...getPositionerProps()} />;
 * }
 *
 * class App extends Component {
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
export const useRemirrorContext = <GExtension extends AnyExtension = any>() => {
  const params = useContext<InjectedRemirrorProps<GExtension>>(RemirrorContext as any);

  if (!params) {
    throw new Error('There is no remirror context defined.');
  }

  return params;
};

/**
 * A low level context picker to obtain the manager from within a RemirrorManager context
 */
export const useRemirrorManager = <GExtension extends AnyExtension = any>() => {
  const manager = useContext<ExtensionManager<GExtension>>(RemirrorManagerContext as any);

  if (!manager) {
    throw new Error('There is no manager defined within the context.');
  }

  return manager;
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
