import { useContext } from 'react';

import { AnyEditorManager, ErrorConstant, invariant } from '@remirror/core';

import { RemirrorContext } from '../react-contexts';
import { InjectedRenderEditorProps } from '../react-types';

/**
 * This provides access to the Remirror Editor context using hooks.
 *
 * @remarks
 *
 * The following example takes the position props from
 * ```ts
 * import { RemirrorProvider, useRemirror } from 'remirror';
 *
 * const HooksComponent = (props) => {
 *   // This pulls the remirror props out from the context.
 *   const { getPositionerProps } = useRemirror();
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
export function useRemirror<
  ManagerType extends AnyEditorManager = AnyEditorManager
>(): InjectedRenderEditorProps<ManagerType> {
  const params = useContext(RemirrorContext);

  invariant(params, {
    code: ErrorConstant.REACT_PROVIDER_CONTEXT,
  });

  return params;
}
