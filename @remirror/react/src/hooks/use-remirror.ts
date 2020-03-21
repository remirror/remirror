import { useContext } from 'react';
import invariant from 'tiny-invariant';

import { AnyExtension } from '@remirror/core';

import { RemirrorContext } from '../react-contexts';
import { InjectedRemirrorProps } from '../react-types';

/**
 * This provides access to the Remirror Editor context using hooks.
 *
 * ```ts
 * import { RemirrorProvider, useRemirrorContext } from 'remirror';
 *
 * function HooksComponent(props) {
 *   // This pulls the remirror props out from the context.
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
export const useRemirror = <GExtension extends AnyExtension = any>(): InjectedRemirrorProps<
  GExtension
> => {
  const params = useContext(RemirrorContext);
  invariant(params, 'There is no remirror context defined.');

  return params;
};
