import { useContext } from 'react';

import { invariant, Manager } from '@remirror/core';

import { RemirrorContext } from '../react-contexts';
import { InjectedRenderEditorProps } from '../react-types';

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
export const useRemirror = <ManagerType extends Manager = Manager>(): InjectedRenderEditorProps<
  ManagerType
> => {
  const params = useContext(RemirrorContext);
  invariant(params, { message: 'There is no remirror context defined.' });

  return params;
};
